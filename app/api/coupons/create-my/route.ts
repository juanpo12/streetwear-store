import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createCoupon, generateCode } from "@/lib/coupons"

const Schema = z.object({
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.number(),
  minimumAmount: z.number().optional(),
  usageLimit: z.number().int().optional(),
  prefix: z.string().optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 })
    }
    const startsAt = new Date()
    const expiresAt = parsed.data.expiresInDays ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000) : null
    const code = generateCode({ prefix: parsed.data.prefix || "TEST" })
    const coupon = await createCoupon({
      type: parsed.data.type,
      value: parsed.data.value,
      minimumAmount: parsed.data.minimumAmount,
      usageLimit: parsed.data.usageLimit ?? 1,
      startsAt,
      expiresAt,
      code,
      userId: user.id,
    })
    return NextResponse.json({ ok: true, coupon })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
  }
}

