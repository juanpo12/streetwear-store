import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { canRedeemCoupon } from "@/lib/coupons"

const Schema = z.object({
  code: z.string().min(3),
  total: z.number().nonnegative(),
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
      return NextResponse.json({ error: "Debes iniciar sesión para usar un cupón" }, { status: 401 })
    }
    const check = await canRedeemCoupon({ code: parsed.data.code, userId: user.id, orderTotal: parsed.data.total })
    if (!check.ok) {
      return NextResponse.json({ ok: false, reason: check.reason }, { status: 400 })
    }
    return NextResponse.json({ ok: true, discount: check.discount, code: parsed.data.code })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
  }
}

