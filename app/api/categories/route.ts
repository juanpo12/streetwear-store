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

export async function POST(req: Request) {
  try {
    const { name, slug, description } = await req.json()

    // Generate slug from name if not provided
    const categorySlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const newCategory = await db
      .insert(categories)
      .values({
        name,
        slug: categorySlug,
        description,
        imageUrl: null,
        isActive: true,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
      })

    return NextResponse.json(newCategory[0])
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}