import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { orders, users, orderItems, productImages, addresses } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

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

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
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

    const orderRows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
        email: orders.email,
        phone: orders.phone,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        fulfillmentStatus: orders.fulfillmentStatus,
        subtotalPrice: orders.subtotalPrice,
        totalTax: orders.totalTax,
        totalShipping: orders.totalShipping,
        totalPrice: orders.totalPrice,
        currency: orders.currency,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (orderRows.length === 0) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 })
    }

    const order = orderRows[0]

    let customerName: string | null = null
    if (order.userId) {
      const u = await db
        .select({ fullName: users.fullName })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1)
      customerName = u[0]?.fullName || null
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        totalPrice: orderItems.totalPrice,
        productTitle: orderItems.productTitle,
        variantTitle: orderItems.variantTitle,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    const enrichedItems = [] as any[]
    for (const it of items) {
      const imgs = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, it.productId))
        .orderBy(desc(productImages.position))
        .limit(1)
      enrichedItems.push({
        ...it,
        imageUrl: imgs[0]?.url || "/placeholder.svg",
      })
    }

    const shipping = await db
      .select({
        id: addresses.id,
        firstName: addresses.firstName,
        lastName: addresses.lastName,
        company: addresses.company,
        address1: addresses.address1,
        address2: addresses.address2,
        city: addresses.city,
        province: addresses.province,
        country: addresses.country,
        zip: addresses.zip,
        phone: addresses.phone,
        type: addresses.type,
      })
      .from(addresses)
      .where(eq(addresses.orderId, orderId))

    const shippingAddress = shipping.find((a) => a.type === "shipping") || null
    const billingAddress = shipping.find((a) => a.type === "billing") || null

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        customerName,
        items: enrichedItems,
        shippingAddress,
        billingAddress,
      },
    })
  } catch (error) {
    console.error("GET /api/admin/orders/[orderId] error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}