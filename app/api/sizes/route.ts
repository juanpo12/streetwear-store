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