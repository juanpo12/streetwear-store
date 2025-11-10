import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { orders, users, orderItems } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
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

    // Obtener órdenes
    const allOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
        email: orders.email,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        fulfillmentStatus: orders.fulfillmentStatus,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))

    // Enriquecer con nombre del cliente y cantidad de items
    const result = [] as any[]
    for (const o of allOrders) {
      let customerName = null as string | null
      if (o.userId) {
        const u = await db
          .select({ fullName: users.fullName, email: users.email })
          .from(users)
          .where(eq(users.id, o.userId))
          .limit(1)
        customerName = u[0]?.fullName || null
      }

      const items = await db
        .select({ id: orderItems.id, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, o.id))

      const itemsCount = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)

      result.push({
        ...o,
        customerName,
        itemsCount,
      })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("GET /api/admin/orders error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}