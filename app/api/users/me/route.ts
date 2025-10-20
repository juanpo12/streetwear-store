import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const result = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    const record = result[0] || null
    const role = record?.role || 'user'

    return NextResponse.json({
      success: true,
      data: { id: user.id, role },
      isAdmin: role === 'admin',
    })
  } catch (error) {
    console.error('GET /api/users/me error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}