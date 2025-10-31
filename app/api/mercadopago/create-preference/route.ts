import { createPreference } from "@/lib/mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { products, productVariants, productImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Zod schema for request validation
const CreatePreferenceSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("ID de producto inválido"),
    variantId: z.string().uuid("ID de variante inválido").optional(),
    quantity: z.number().int().min(1, "La cantidad debe ser mayor a 0"),
  })),
  orderId: z.string().min(1, "ID de orden requerido"),
  payer: z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    phone: z.object({
      area_code: z.string().optional(),
      number: z.string().optional(),
    }).optional(),
  }).optional(),
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

    const { items, orderId, payer } = validationResult.data;

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
      if (item.variantId) {
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
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: image?.url || "/placeholder.jpg",
        quantity: item.quantity,
        variantId: item.variantId,
        variantTitle: variantTitle,
      });
    }

    // Create preference with secure data
    const preferenceData = {
      items: secureItems,
      orderId,
      payer,
    };

    const preference = await createPreference(preferenceData);
    return NextResponse.json(preference);
    
  } catch (error) {
    console.error("Error creating preference:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}