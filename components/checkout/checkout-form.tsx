"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/components/cart-provider"
import { Loader2, CreditCard, User, Mail, Phone, Tag, ArrowLeft, Check, ShoppingBag, Sparkles } from "lucide-react"
import { z } from "zod"
import Image from "next/image"

const CheckoutSchema = z.object({
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos").optional().or(z.literal("")),
  discountCode: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof CheckoutSchema>

interface CheckoutFormProps {
  onBack: () => void
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const { user } = useAuth()
  const { state, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPreview, setCouponPreview] = useState<number>(0)
  const [myCoupons, setMyCoupons] = useState<Array<{ code: string }>>([])
  const [showCouponList, setShowCouponList] = useState(false)
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    phone: "",
    discountCode: "",
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      }))
    }
  }, [user])

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    if (field === 'discountCode') {
      setCouponError(null)
      setCouponPreview(0)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const validatedData = CheckoutSchema.parse(formData)
      const cartItems = state.items.map(item => ({
        productId: (item.productId ?? item.id).toString(),
        variantId: item.variantId || null,
        quantity: item.quantity,
      }))

      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          email: validatedData.email,
          phone: validatedData.phone || null,
          discountCode: validatedData.discountCode || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Error al procesar el pedido")

      clearCart()
      if (result.init_point) {
        window.location.href = result.init_point
      } else {
        throw new Error("No se pudo obtener el enlace de pago")
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error inesperado al procesar el pedido")
      }
    } finally {
      setLoading(false)
    }
  }

  const validateCoupon = async () => {
    if (!formData.discountCode) return
    
    try {
      setCouponError(null)
      setCouponLoading(true)
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.discountCode, total: total })
      })
      const data = await res.json()
      
      if (!res.ok) {
        const reasons: Record<string, string> = {
          not_found: "Cupón no encontrado",
          inactive: "Cupón inactivo",
          not_started: "Cupón todavía no está vigente",
          expired: "Cupón expirado",
          not_assigned: "Este cupón no está asignado a tu cuenta",
          min_amount: "El total no alcanza el mínimo requerido",
          global_limit: "Se alcanzó el límite de uso del cupón",
          already_used: "Ya utilizaste este cupón"
        }
        setCouponError(reasons[data?.reason] || data?.error || "Cupón inválido")
        setCouponPreview(0)
      } else {
        setCouponPreview(Number(data.discount) || 0)
      }
    } catch (e: any) {
      setCouponError(e?.message || "Error validando cupón")
      setCouponPreview(0)
    } finally {
      setCouponLoading(false)
    }
  }

  const subtotal = totalPrice
  const shipping = 500
  const tax = 0
  const total = subtotal + shipping + tax
  const displayTotal = Math.max(0, total - couponPreview)

  useEffect(() => {
    let ignore = false
    const fetchCoupons = async () => {
      try {
        const res = await fetch('/api/coupons/my')
        const data = await res.json()
        if (!ignore && res.ok) {
          setMyCoupons((data.coupons || []).map((c: any) => ({ code: c.code })))
        }
      } catch {}
    }
    if (user) fetchCoupons()
    return () => { ignore = true }
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-amber-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">
              Finalizar Compra
            </h1>
            <p className="text-amber-800 mt-1">
              Completa tus datos para proceder al pago seguro
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Checkout Form - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Info Card */}
            {user && (
              <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="secondary">
                      <Check className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="tu@email.com"
                        disabled={loading}
                        className="pl-10 h-11 border-input focus:border-ring focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">
                      Teléfono <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+54 9 11 1234-5678"
                        disabled={loading}
                        className="pl-10 h-11 border-input focus:border-ring focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Discount Code - Improved Combo */}
                  <div className="space-y-2">
                    <Label htmlFor="discountCode" className="text-foreground font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Código de descuento
                    </Label>
                    <div className="relative">
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                          id="discountCode"
                          type="text"
                          value={formData.discountCode}
                          onChange={(e) => handleInputChange("discountCode", e.target.value)}
                          onFocus={() => myCoupons.length > 0 && setShowCouponList(true)}
                          onBlur={() => setTimeout(() => setShowCouponList(false), 200)}
                          placeholder={myCoupons.length > 0 ? "Escribe o selecciona un cupón" : "Ingresa tu código"}
                          disabled={loading}
                          className="pl-10 pr-24 h-11 border-input focus:border-ring focus:ring-ring"
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={couponLoading || !formData.discountCode}
                          onClick={validateCoupon}
                          variant="default"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-4"
                        >
                          {couponLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Aplicar"
                          )}
                        </Button>
                      </div>
                      
                      {/* Dropdown List */}
                      {showCouponList && myCoupons.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                          {myCoupons.map((coupon) => (
                            <button
                              key={coupon.code}
                              type="button"
                              onClick={() => {
                                handleInputChange("discountCode", coupon.code)
                                setShowCouponList(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3 border-b border-border last:border-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{coupon.code}</p>
                                <p className="text-xs text-muted-foreground">Cupón disponible</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Coupon Status */}
                    {couponPreview > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-secondary border border-border rounded-lg">
                        <Check className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">
                          ¡Descuento aplicado! -${couponPreview.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {couponError && (
                      <div className="p-3 bg-card border border-destructive/30 rounded-lg">
                        <p className="text-sm text-destructive">{couponError}</p>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-card border border-destructive/30 rounded-lg">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    variant="default"
                    className="w-full h-12 text-base font-semibold"
                    disabled={loading || state.items.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Proceder al Pago • ${displayTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-border bg-secondary shadow-sm">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Pago 100% Seguro</h4>
                    <p className="text-sm text-muted-foreground">
                      Procesamos tu pago a través de MercadoPago. Aceptamos tarjetas de crédito, 
                      débito, transferencias y más métodos de pago.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - 2 columns */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <Card className="border-border shadow-lg bg-card">
                <CardHeader className="border-b border-border bg-secondary">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-card shadow-sm flex-shrink-0 relative">
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                            {item.name}
                          </h4>
                          {item.size && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Talla: {item.size}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              Cant: {item.quantity}
                            </span>
                            <span className="font-semibold text-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Envío</span>
                      <span className="font-medium">${shipping.toFixed(2)}</span>
                    </div>
                    {couponPreview > 0 && (
                      <div className="flex justify-between text-sm text-accent font-medium">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-accent" />
                          Descuento
                        </span>
                        <span>- ${couponPreview.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        ${displayTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
