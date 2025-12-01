"use client"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MyCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/coupons/my')
        const data = await res.json()
        if (!ignore) {
          if (!res.ok) setError(data?.error || 'Error')
          else setCoupons(data.coupons || [])
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Error')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link href="/profile">Volver</Link>
          </Button>
          <h1 className="text-streetwear-lg">Mis Cupones</h1>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
          </div>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-sm text-muted-foreground">No tienes cupones disponibles</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const expires = c.expiresAt ? new Date(c.expiresAt) : null
              const valueText = c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed_amount' ? `$${Number(c.value).toFixed(2)}` : 'Envío gratis'
              return (
                <Card key={c.code} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="text-lg">{c.code}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{c.type}</Badge>
                      <span className="font-semibold">{valueText}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {expires ? `Vence: ${expires.toLocaleDateString('es-ES')}` : 'Sin vencimiento definido'}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

