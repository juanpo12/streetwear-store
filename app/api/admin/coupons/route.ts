import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { coupons, users } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { createCoupon } from "@/lib/coupons"

const AdminCreateSchema = z.object({
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.number().nonnegative(),
  minimumAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  code: z.string().min(6).max(64).optional(),
  prefix: z.string().max(16).optional(),
  userId: z.string().email().or(z.string().uuid()).optional(),
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

    const list = await db
      .select({
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
      })
      .from(coupons)
      .orderBy(desc(coupons.createdAt))

    return NextResponse.json({ success: true, data: list })
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await ensureAdmin()
    if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })

    const body = await req.json()
    const parsed = AdminCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })
    }

    // Resolve userId if an email was provided
    let userId: string | undefined = undefined
    if (parsed.data.userId) {
      const uid = parsed.data.userId
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid)
      if (isUuid) {
        userId = uid
      } else {
        const found = await db.select({ id: users.id }).from(users).where(eq(users.email, uid)).limit(1)
        if (!found.length) {
          return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
        }
        userId = found[0].id
      }
    }

    const result = await createCoupon({ ...parsed.data, userId })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("POST /api/admin/coupons error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
