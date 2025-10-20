import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name)

    return NextResponse.json(allCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}