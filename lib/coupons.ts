import crypto from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import { coupons, couponRedemptions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCouponCode(opts?: { prefix?: string; groups?: number; groupSize?: number }) {
  const groups = opts?.groups ?? 3
  const groupSize = opts?.groupSize ?? 4
  const total = groups * groupSize
  const bytes = crypto.randomBytes(total)
  const chars: string[] = []
  for (let i = 0; i < total; i++) {
    const idx = bytes[i] % CHARSET.length
    chars.push(CHARSET[idx])
  }
  const grouped = Array.from({ length: groups }, (_, g) => chars.slice(g * groupSize, (g + 1) * groupSize).join('')).join('-')
  const prefix = opts?.prefix ? opts.prefix.toUpperCase().replace(/[^A-Z0-9-]/g, '') : ''
  return prefix ? `${prefix}-${grouped}` : grouped
}

const CouponTypeEnum = z.enum(['percentage', 'fixed_amount', 'free_shipping'])

const CreateCouponSchema = z
  .object({
    type: CouponTypeEnum,
    value: z.number().nonnegative(),
    minimumAmount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    startsAt: z.date().optional(),
    expiresAt: z.date().optional(),
    code: z.string().min(6).max(64).optional(),
    prefix: z.string().max(16).optional(),
    groups: z.number().int().min(1).max(8).optional(),
    groupSize: z.number().int().min(3).max(8).optional(),
  })
  .refine((d) => (d.type === 'percentage' ? d.value > 0 && d.value <= 90 : true), {
    message: 'percentage out of range',
  })
  .refine((d) => (d.type === 'fixed_amount' ? d.value > 0 : true), {
    message: 'fixed_amount must be > 0',
  })
  .refine((d) => (d.type === 'free_shipping' ? d.value === 0 : true), {
    message: 'free_shipping value must be 0',
  })
  .refine((d) => (!d.expiresAt || !d.startsAt || d.expiresAt > d.startsAt), {
    message: 'expiresAt must be after startsAt',
  })

export type CreateCouponInput = z.infer<typeof CreateCouponSchema>

export async function createCoupon(input: CreateCouponInput) {
  const parsed = CreateCouponSchema.parse(input)
  let code = parsed.code
    ? parsed.code.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    : generateCouponCode({ prefix: parsed.prefix, groups: parsed.groups, groupSize: parsed.groupSize })
  let attempts = 0
  while (attempts < 5) {
    const existing = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code)).limit(1)
    if (existing.length === 0) break
    code = generateCouponCode({ prefix: parsed.prefix, groups: parsed.groups, groupSize: parsed.groupSize })
    attempts++
  }
  const now = new Date()
  const values = {
    code,
    type: parsed.type,
    value: parsed.value.toString(),
    minimumAmount: parsed.minimumAmount ? parsed.minimumAmount.toString() : null,
    usageLimit: parsed.usageLimit ?? null,
    usedCount: 0,
    isActive: true,
    startsAt: parsed.startsAt ?? null,
    expiresAt: parsed.expiresAt ?? null,
    createdAt: now,
    updatedAt: now,
  }
  const inserted = await db
    .insert(coupons)
    .values(values)
    .returning({
      id: coupons.id,
      code: coupons.code,
      type: coupons.type,
      value: coupons.value,
      minimumAmount: coupons.minimumAmount,
      usageLimit: coupons.usageLimit,
      usedCount: coupons.usedCount,
      isActive: coupons.isActive,
      startsAt: coupons.startsAt,
      expiresAt: coupons.expiresAt,
      createdAt: coupons.createdAt,
      updatedAt: coupons.updatedAt,
    })
  return inserted[0]
}

export function generateCode(options?: { prefix?: string; groups?: number; groupSize?: number }) {
  return generateCouponCode(options)
}

export async function canRedeemCoupon(params: { code: string; userId: string; orderTotal: number; at?: Date }) {
  const at = params.at ?? new Date()
  const [c] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, params.code.toUpperCase()))
    .limit(1)
  if (!c) return { ok: false, reason: 'not_found' as const }
  if (!c.isActive) return { ok: false, reason: 'inactive' as const }
  if (c.startsAt && at < c.startsAt) return { ok: false, reason: 'not_started' as const }
  if (c.expiresAt && at > c.expiresAt) return { ok: false, reason: 'expired' as const }
  if (c.userId && c.userId !== params.userId) return { ok: false, reason: 'not_assigned' as const }
  if (c.minimumAmount && params.orderTotal < Number(c.minimumAmount)) return { ok: false, reason: 'min_amount' as const }
  if (c.usageLimit && c.usedCount >= c.usageLimit) return { ok: false, reason: 'global_limit' as const }
  const existing = await db
    .select({ id: couponRedemptions.id })
    .from(couponRedemptions)
    .where(and(eq(couponRedemptions.couponId, c.id), eq(couponRedemptions.userId, params.userId)))
    .limit(1)
  if (existing.length > 0) return { ok: false, reason: 'already_used' as const }

  // compute discount preview
  let discount = 0
  if (c.type === 'percentage') discount = (params.orderTotal * Number(c.value)) / 100
  else if (c.type === 'fixed_amount') discount = Number(c.value)
  else discount = 0

  return { ok: true, coupon: c, discount }
}

export async function redeemCoupon(params: { code: string; userId: string; orderId?: string; orderTotal: number }) {
  return db.transaction(async (tx) => {
    const check = await canRedeemCoupon({ code: params.code, userId: params.userId, orderTotal: params.orderTotal })
    if (!check.ok) return { ok: false, reason: check.reason }
    const c = check.coupon!
    await tx.insert(couponRedemptions).values({ couponId: c.id, userId: params.userId, orderId: params.orderId ?? null })
    await tx
      .update(coupons)
      .set({ usedCount: (c.usedCount ?? 0) + 1, updatedAt: new Date() })
      .where(eq(coupons.id, c.id))
    return { ok: true, discount: check.discount, coupon: c }
  })
}
