import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { coupons, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const AdminUpdateSchema = z.object({
  code: z.string().min(6).max(64).optional(),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]).optional(),
  value: z.number().nonnegative().optional(),
  minimumAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
  user: z.string().email().or(z.string().uuid()).nullable().optional(),
})

async function ensureAdmin() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const authUser = data.user
  if (!authUser) return { ok: false as const, status: 401, error: "No autenticado" }
  const roleResult = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)
  const role = roleResult[0]?.role || "user"
  if (role !== "admin") return { ok: false as const, status: 403, error: "No autorizado" }
  return { ok: true as const }
}

export async function PUT(req: NextRequest, { params }: { params: { couponId: string } }) {
  try {
    const admin = await ensureAdmin()
    if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })

    const id = params.couponId
    const body = await req.json()
    const parsed = AdminUpdateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })

    const v = parsed.data
    const updateValues: any = {}
    if (v.code !== undefined) updateValues.code = v.code.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (v.type !== undefined) updateValues.type = v.type
    if (v.value !== undefined) updateValues.value = v.value.toString()
    if (v.minimumAmount !== undefined) updateValues.minimumAmount = v.minimumAmount === null ? null : v.minimumAmount.toString()
    if (v.usageLimit !== undefined) updateValues.usageLimit = v.usageLimit === null ? null : v.usageLimit
    if (v.isActive !== undefined) updateValues.isActive = v.isActive
    if (v.startsAt !== undefined) updateValues.startsAt = v.startsAt
    if (v.expiresAt !== undefined) updateValues.expiresAt = v.expiresAt
    if (v.userId !== undefined) updateValues.userId = v.userId
    else if (v.user !== undefined) {
      if (v.user === null) {
        updateValues.userId = null
      } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.user)
        if (isUuid) {
          updateValues.userId = v.user
        } else {
          const found = await db.select({ id: users.id }).from(users).where(eq(users.email, v.user)).limit(1)
          updateValues.userId = found[0]?.id ?? null
        }
      }
    }

    const updated = await db
      .update(coupons)
      .set({ ...updateValues, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning({
        id: coupons.id,
        code: coupons.code,
        type: coupons.type,
        value: coupons.value,
        minimumAmount: coupons.minimumAmount,
        usageLimit: coupons.usageLimit,
        usedCount: coupons.usedCount,
        isActive: coupons.isActive,
        userId: coupons.userId,
        startsAt: coupons.startsAt,
        expiresAt: coupons.expiresAt,
        createdAt: coupons.createdAt,
        updatedAt: coupons.updatedAt,
      })

    return NextResponse.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error("PUT /api/admin/coupons/[id] error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { couponId: string } }) {
  try {
    const admin = await ensureAdmin()
    if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })

    const id = params.couponId
    await db.delete(coupons).where(eq(coupons.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
