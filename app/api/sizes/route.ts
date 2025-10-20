import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sizes } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all active sizes from the sizes table
    const allSizes = await db
      .select({
        id: sizes.id,
        name: sizes.name,
        displayOrder: sizes.displayOrder,
      })
      .from(sizes)
      .where(eq(sizes.isActive, true))
      .orderBy(asc(sizes.displayOrder), asc(sizes.name))

    return NextResponse.json(allSizes)
  } catch (error) {
    console.error('Error fetching sizes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sizes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, displayOrder } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const newSize = await db
      .insert(sizes)
      .values({
        name,
        displayOrder: displayOrder || 0,
        isActive: true,
      })
      .returning({
        id: sizes.id,
        name: sizes.name,
        displayOrder: sizes.displayOrder,
      })

    return NextResponse.json(newSize[0], { status: 201 })
  } catch (error) {
    console.error('Error creating size:', error)
    return NextResponse.json(
      { error: 'Failed to create size' },
      { status: 500 }
    )
  }
}