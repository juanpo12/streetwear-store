import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { appSettings, users } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"

const NewUserCouponSchema = z
  .object({
    enabled: z.boolean(),
    type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
    value: z.number().nonnegative(),
    minimumAmount: z.number().positive().optional(),
    prefix: z.string().max(16).optional(),
    expiresInDays: z.number().int().min(1).max(365).optional(),
  })
  .refine((d) => (d.type === "percentage" ? d.value > 0 && d.value <= 90 : true), {
    message: "percentage out of range",
  })
  .refine((d) => (d.type === "fixed_amount" ? d.value > 0 : true), {
    message: "fixed_amount must be > 0",
  })
  .refine((d) => (d.type === "free_shipping" ? d.value === 0 : true), {
    message: "free_shipping value must be 0",
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

export async function GET(_req: NextRequest) {
  try {
    const admin = await ensureAdmin()
    if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })

    await db.execute(sql`CREATE TABLE IF NOT EXISTS app_settings (
      key text PRIMARY KEY,
      value jsonb,
      updated_at timestamp DEFAULT now() NOT NULL
    )`)

    const existing = await db.select().from(appSettings).where(eq(appSettings.key, "new_user_coupon")).limit(1)
    const value = existing[0]?.value ?? null
    return NextResponse.json({ success: true, data: { newUserCoupon: value } })
  } catch (error) {
    console.error("GET /api/admin/app-settings error:", error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await ensureAdmin()
    if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })

    const body = await req.json()
    const parsed = NewUserCouponSchema.safeParse(body?.newUserCoupon)
    if (!parsed.success) {
      const first = parsed.error?.issues?.[0]?.message || "Datos inválidos"
      return NextResponse.json({ success: false, error: first }, { status: 400 })
    }

    await db.execute(sql`CREATE TABLE IF NOT EXISTS app_settings (
      key text PRIMARY KEY,
      value jsonb,
      updated_at timestamp DEFAULT now() NOT NULL
    )`)

    const existing = await db.select().from(appSettings).where(eq(appSettings.key, "new_user_coupon")).limit(1)
    const now = new Date()
    if (existing.length) {
      await db.update(appSettings).set({ value: parsed.data, updatedAt: now }).where(eq(appSettings.key, "new_user_coupon"))
    } else {
      await db.insert(appSettings).values({ key: "new_user_coupon", value: parsed.data, updatedAt: now })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/admin/app-settings error:", error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 })
  }
}
