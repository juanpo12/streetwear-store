import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, addresses, productImages } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Validar que el userId sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Verificar autenticación
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario autenticado solo pueda acceder a sus propias órdenes
    if (data.user.id !== userId) {
      return NextResponse.json(
        { error: "No autorizado para acceder a estas órdenes" },
        { status: 403 }
      );
    }

    // Obtener las órdenes del usuario con sus items y direcciones
    const userOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
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
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Para cada orden, obtener sus items y direcciones
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        // Obtener items de la orden
        const items = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            totalPrice: orderItems.totalPrice,
            productTitle: orderItems.productTitle,
            variantTitle: orderItems.variantTitle,
            productId: orderItems.productId,
            variantId: orderItems.variantId,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        // Obtener imagen principal para los productos de la orden
        const productIds = Array.from(new Set(items.map((i) => i.productId))).filter(Boolean) as string[];
        let imagesByProduct: Record<string, string> = {};
        if (productIds.length > 0) {
          const productImgs = await db
            .select({ productId: productImages.productId, url: productImages.url, position: productImages.position })
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
            .orderBy(productImages.position);

          for (const img of productImgs) {
            if (!imagesByProduct[img.productId]) {
              imagesByProduct[img.productId] = img.url;
            }
          }
        }

        const itemsWithImages = items.map((item) => ({
          ...item,
          imageUrl: imagesByProduct[item.productId] || "/placeholder.svg",
        }));

        // Obtener direcciones de la orden
        const orderAddresses = await db
          .select({
            id: addresses.id,
            type: addresses.type,
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
          })
          .from(addresses)
          .where(eq(addresses.orderId, order.id));

        return {
          ...order,
          items: itemsWithImages,
          addresses: orderAddresses,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: ordersWithDetails,
    });

  } catch (error) {
    console.error("Error obteniendo órdenes del usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}