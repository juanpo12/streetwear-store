import { createPreference } from "@/lib/mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { canRedeemCoupon } from "@/lib/coupons";
import { products, productVariants, productImages, orders, orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// Zod schema for request validation
const CreatePreferenceSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid("ID de producto inválido"),
      variantId: z.string().uuid("ID de variante inválido").nullable().optional(),
      quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
    })
  ).min(1, "Debe incluir al menos un producto"),
  email: z.string().email("Email inválido"),
  phone: z.string().nullable().optional(),
  discountCode: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request data with Zod
    const validationResult = CreatePreferenceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Datos de entrada inválidos", 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { items, email, phone, discountCode } = validationResult.data;

    // Get current user (optional)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch product data from database for security
    const secureItems = [];
    
    for (const item of items) {
      // Get product data from database
      const productQuery = db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          isActive: products.isActive,
          stock: products.stock,
          trackQuantity: products.trackQuantity,
          continueSellingWhenOutOfStock: products.continueSellingWhenOutOfStock,
        })
        .from(products)
        .where(and(
          eq(products.id, item.productId),
          eq(products.isActive, true)
        ));

      const [product] = await productQuery;

      if (!product) {
        return NextResponse.json(
          { error: `Producto con ID ${item.productId} no encontrado o inactivo` },
          { status: 404 }
        );
      }

      let finalPrice = parseFloat(product.price);
      let variantTitle = "";
      let actualStock = product.stock;

      // If variant is specified, get variant data
      if (item.variantId && item.variantId !== item.productId) {
        const variantQuery = db
          .select({
            id: productVariants.id,
            title: productVariants.title,
            price: productVariants.price,
            isActive: productVariants.isActive,
            inventoryQuantity: productVariants.inventoryQuantity,
          })
          .from(productVariants)
          .where(and(
            eq(productVariants.id, item.variantId),
            eq(productVariants.productId, item.productId),
            eq(productVariants.isActive, true)
          ));

        const [variant] = await variantQuery;

        if (!variant) {
          return NextResponse.json(
            { error: `Variante con ID ${item.variantId} no encontrada o inactiva` },
            { status: 404 }
          );
        }

        // Use variant price if available, otherwise use product price
        finalPrice = variant.price ? parseFloat(variant.price) : finalPrice;
        variantTitle = variant.title;
        actualStock = variant.inventoryQuantity;
      }

      // Check stock availability
      if (product.trackQuantity && !product.continueSellingWhenOutOfStock) {
        if (actualStock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para ${product.name}. Disponible: ${actualStock}, solicitado: ${item.quantity}` },
            { status: 400 }
          );
        }
      }

      // Get product image
      const imageQuery = db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, item.productId))
        .orderBy(productImages.position)
        .limit(1);

      const [image] = await imageQuery;

      // Create secure item with database data
      secureItems.push({
        productId: product.id,
        productTitle: product.name,
        price: finalPrice,
        image: image?.url || "/placeholder.jpg",
        quantity: item.quantity,
        variantId: item.variantId,
        variantTitle: variantTitle,
      });
    }

    // Calculate totals
    const subtotalPrice = secureItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)

    const totalTax = 0 // No tax for now
    const totalShipping = 0 // Free shipping for now
    let totalPrice = subtotalPrice + totalTax + totalShipping

    // Apply coupon discount if provided and user is authenticated
    let appliedDiscount = 0
    if (discountCode) {
      if (!user?.id) {
        return NextResponse.json({ error: "Debes iniciar sesión para usar un cupón" }, { status: 401 })
      }
      const check = await canRedeemCoupon({ code: discountCode, userId: user.id, orderTotal: totalPrice })
      if (!check.ok) {
        const reason = check.reason
        const messages: Record<string, string> = {
          not_found: "Cupón no encontrado",
          inactive: "Cupón inactivo",
          not_started: "Cupón todavía no está vigente",
          expired: "Cupón expirado",
          not_assigned: "Este cupón no está asignado a tu cuenta",
          min_amount: "El total no alcanza el mínimo requerido por el cupón",
          global_limit: "Se alcanzó el límite de uso del cupón",
          already_used: "Ya utilizaste este cupón",
        }
        return NextResponse.json({ error: messages[reason] || "Cupón inválido" }, { status: 400 })
      }
      appliedDiscount = Math.min(check.discount, totalPrice)
      totalPrice = Math.max(0, totalPrice - appliedDiscount)

      // Pro-rate discount across items to keep MercadoPago total coherente
      if (appliedDiscount > 0 && subtotalPrice > 0) {
        // calcular descuentos por item en unit_price
        let remaining = appliedDiscount
        for (let i = 0; i < secureItems.length; i++) {
          const item = secureItems[i]
          const itemTotal = item.price * item.quantity
          const fraction = itemTotal / subtotalPrice
          let itemDiscountTotal = Number((appliedDiscount * fraction).toFixed(2))
          if (i === secureItems.length - 1) {
            // ajustar último para compensar redondeo
            itemDiscountTotal = Number(remaining.toFixed(2))
          }
          remaining = Number((remaining - itemDiscountTotal).toFixed(2))
          const discountPerUnit = Number((itemDiscountTotal / item.quantity).toFixed(2))
          const newUnit = Math.max(0, Number((item.price - discountPerUnit).toFixed(2)))
          item.price = newUnit
        }
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create order in database
    const [createdOrder] = await db.insert(orders).values({
      orderNumber,
      userId: user?.id || null,
      email,
      phone: phone || null,
      status: "pending",
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      subtotalPrice: subtotalPrice.toString(),
      totalTax: totalTax.toString(),
      totalShipping: totalShipping.toString(),
      totalPrice: totalPrice.toString(),
      currency: "ARS",
      notes: discountCode || null,
    }).returning()

    // Create order items
    const orderItemsData = secureItems.map(item => ({
      orderId: createdOrder.id,
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity,
      price: item.price.toString(),
      totalPrice: (item.price * item.quantity).toString(),
      productTitle: item.productTitle,
      variantTitle: item.variantTitle || null,
    }))

    await db.insert(orderItems).values(orderItemsData)

    // Prepare data for MercadoPago
    const preferenceData = {
      items: secureItems.map(item => ({
        id: item.productId,
        title: item.productTitle,
        description: item.variantTitle || item.productTitle,
        picture_url: item.image,
        category_id: "fashion",
        quantity: item.quantity,
        currency_id: "ARS",
        unit_price: item.price,
      })),
      orderId: createdOrder.id,
    }

    // Create MercadoPago preference
    const preference = await createPreference(preferenceData)

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
    })
    
  } catch (error: any) {
    // Log detallado
    console.error("Error creating preference:", error);

    // Propagar información útil cuando viene desde MercadoPago
    if (error && typeof error === 'object') {
      const status = error.status || 500;
      const message = error.message || 'Error interno del servidor';
      const blocked_by = error.blocked_by;
      const code = error.code;

      return NextResponse.json(
        {
          error: message,
          ...(blocked_by ? { blocked_by } : {}),
          ...(code ? { code } : {}),
        },
        { status }
      );
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
