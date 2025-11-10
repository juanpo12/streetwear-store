import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { orders, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const ALLOWED_STATUS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const
const ALLOWED_PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"] as const
const ALLOWED_FULFILLMENT = ["unfulfilled", "partial", "fulfilled"] as const

export async function PATCH(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    const authUser = data.user

    if (!authUser) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const roleResult = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1)
    const role = roleResult[0]?.role || "user"
    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { status, paymentStatus, fulfillmentStatus } = body

    const payload: Partial<typeof orders.$inferInsert> = {}
    if (status) {
      if (!ALLOWED_STATUS.includes(status)) {
        return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 })
      }
      payload.status = status
    }
    if (paymentStatus) {
      if (!ALLOWED_PAYMENT_STATUS.includes(paymentStatus)) {
        return NextResponse.json({ success: false, error: "Estado de pago inválido" }, { status: 400 })
      }
      payload.paymentStatus = paymentStatus
    }
    if (fulfillmentStatus) {
      if (!ALLOWED_FULFILLMENT.includes(fulfillmentStatus)) {
        return NextResponse.json({ success: false, error: "Estado de cumplimiento inválido" }, { status: 400 })
      }
      payload.fulfillmentStatus = fulfillmentStatus
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: false, error: "Sin cambios" }, { status: 400 })
    }

    const updated = await db
      .update(orders)
      .set(payload)
      .where(eq(orders.id, orderId))
      .returning({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        fulfillmentStatus: orders.fulfillmentStatus,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
      })

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error("PATCH /api/admin/orders/[orderId] error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}