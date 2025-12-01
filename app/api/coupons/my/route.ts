import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { coupons, couponRedemptions } from "@/lib/db/schema"
import { and, eq, gt, isNull, lte, or, sql } from "drizzle-orm"

export async function GET(_req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 })
  const now = new Date()
  const list = await db.select().from(coupons).where(and(
    eq(coupons.isActive, true),
    or(isNull(coupons.startsAt), lte(coupons.startsAt, now)),
    or(isNull(coupons.expiresAt), gt(coupons.expiresAt, now)),
    or(isNull(coupons.usageLimit), sql`${coupons.usedCount} < ${coupons.usageLimit}`),
    eq(coupons.userId, user.id)
  )).orderBy(coupons.createdAt)
  const redemptions = await db.select({ couponId: couponRedemptions.couponId }).from(couponRedemptions).where(eq(couponRedemptions.userId, user.id))
  const usedSet = new Set(redemptions.map(r => r.couponId))
  const available = list.filter(c => !usedSet.has(c.id))
  return NextResponse.json({ ok: true, coupons: available.map(c => ({ id: c.id, code: c.code, type: c.type, value: Number(c.value), minimumAmount: c.minimumAmount ? Number(c.minimumAmount) : null, expiresAt: c.expiresAt })) })
}

