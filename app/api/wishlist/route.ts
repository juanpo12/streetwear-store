import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { wishlists, products, categories, productImages } from "@/lib/db/schema"
import { and, eq, inArray } from "drizzle-orm"

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const wishlistRows = await db
      .select({
        id: wishlists.id,
        productId: wishlists.productId,
      })
      .from(wishlists)
      .where(eq(wishlists.userId, user.id))

    if (wishlistRows.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const productIds = wishlistRows.map((w) => w.productId)

    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        categoryName: categories.name,
        isActive: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(inArray(products.id, productIds))

    const images = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        altText: productImages.altText,
        position: productImages.position,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds))

    const items = productsData
      .filter((p) => p.isActive)
      .map((p) => {
        const firstImage = images
          .filter((img) => img.productId === p.id)
          .sort((a, b) => a.position - b.position)[0]

        const priceNum = parseFloat(p.price)

        return {
          id: p.id,
          name: p.name,
          price: isNaN(priceNum) ? 0 : priceNum,
          image: firstImage ? firstImage.url : "/placeholder.svg",
          category: p.categoryName || "GENERAL",
        }
      })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error("GET /api/wishlist error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const productId = typeof body.productId === "string" ? body.productId : ""

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 })
    }

    const existing = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(wishlists).values({
        userId: user.id,
        productId,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/wishlist error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

