import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { wishlists } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const productId = params.productId

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 })
    }

    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/wishlist/[productId] error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

