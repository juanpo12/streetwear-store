import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { colors } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, hexCode, displayOrder } = body

    // Insert new color into the database
    const newColor = await db
      .insert(colors)
      .values({
        name,
        hexCode,
        displayOrder,
        isActive: true,
      })
      .returning({
        id: colors.id,
        name: colors.name,
        hexCode: colors.hexCode,
        displayOrder: colors.displayOrder,
      })

    return NextResponse.json(newColor[0], { status: 201 })
  } catch (error) {
    console.error('Error creating color:', error)
    return NextResponse.json(
      { error: 'Failed to create color' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all active colors from the colors table
    const allColors = await db
      .select({
        id: colors.id,
        name: colors.name,
        hexCode: colors.hexCode,
        displayOrder: colors.displayOrder,
      })
      .from(colors)
      .where(eq(colors.isActive, true))
      .orderBy(asc(colors.displayOrder), asc(colors.name))

    return NextResponse.json(allColors)
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    )
  }
}