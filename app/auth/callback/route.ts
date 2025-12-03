import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users, appSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createCoupon, generateCode } from '@/lib/coupons'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id) {
          const exists = await db.select({ id: users.id }).from(users).where(eq(users.id, user.id)).limit(1)
          if (!exists.length) {
            await db.insert(users).values({ id: user.id, email: user.email || '', fullName: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() })
          }
          const setting = await db.select().from(appSettings).where(eq(appSettings.key, 'new_user_coupon')).limit(1)
          const v: any = setting[0]?.value
          if (v && v.enabled) {
            const startsAt = new Date()
            const expiresAt = v.expiresInDays ? new Date(Date.now() + v.expiresInDays * 24 * 60 * 60 * 1000) : undefined
            const codeGen = generateCode({ prefix: v.prefix || 'WELCOME' })
            await createCoupon({
              type: v.type,
              value: Number(v.value),
              minimumAmount: v.minimumAmount != null ? Number(v.minimumAmount) : undefined,
              usageLimit: 1,
              startsAt,
              expiresAt,
              code: codeGen,
              userId: user.id,
            })
          }
        }
      } catch {}
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
