"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useUserOrders } from "@/hooks/use-user-orders"

type UiOrderStatus = "pending" | "processing" | "shipped" | "delivered"

export default function OrderStatusPage() {
  const { orders, loading, error } = useUserOrders()

  const getStatusInfo = (status: string) => {
    const normalized = status.toLowerCase()
    const map: Record<string, { color: string; text: string; icon: any; uiStatus: UiOrderStatus }> = {
      pending: { color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20", text: "Pendiente", icon: Clock, uiStatus: "pending" },
      confirmed: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20", text: "Procesando", icon: Package, uiStatus: "processing" },
      processing: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20", text: "Procesando", icon: Package, uiStatus: "processing" },
      shipped: { color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20", text: "En Camino", icon: Truck, uiStatus: "shipped" },
      delivered: { color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20", text: "Entregado", icon: CheckCircle2, uiStatus: "delivered" },
      cancelled: { color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20", text: "Cancelado", icon: Clock, uiStatus: "pending" },
    }
    return map[normalized] || map["pending"]
  }

  const getProgressPercentage = (uiStatus: UiOrderStatus) => {
    switch (uiStatus) {
      case "pending": return 25
      case "processing": return 50
      case "shipped": return 75
      case "delivered": return 100
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold tracking-tight">Estado de Pedidos</h1>
          </div>
          <p className="text-muted-foreground">
            {loading ? "Cargando tus pedidos…" : orders.length === 0
              ? "No tienes pedidos activos"
              : `Tienes ${orders.length} ${orders.length === 1 ? "pedido activo" : "pedidos activos"}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-24 w-24 text-muted-foreground/20 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No hay pedidos activos</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Cuando realices un pedido, podrás seguir su estado aquí en tiempo real
            </p>
            <Button asChild className="bg-primary hover:bg-accent">
              <Link href="/shop">Explorar Productos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon
              const progress = getProgressPercentage(statusInfo.uiStatus)
              const created = new Date(order.createdAt)
              const total = Number(order.totalPrice)
              const shippingAddress = order.addresses?.find?.(a => a.type === 'shipping')
              const shippingText = shippingAddress
                ? [shippingAddress.address1, shippingAddress.address2, shippingAddress.city, shippingAddress.province, shippingAddress.country, shippingAddress.zip]
                    .filter(Boolean)
                    .join(', ')
                : '—'

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Orden {order.orderNumber}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          Pedido el{" "}
                          {created.toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <Badge variant="outline" className={statusInfo.color}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusInfo.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso del pedido</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="text-center">
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
                              progress >= 25 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">Pendiente</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
                              progress >= 50 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">Procesando</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
                              progress >= 75 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Truck className="h-4 w-4" />
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">En Camino</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
                              progress >= 100 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">Entregado</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Productos</div>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.productTitle}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{item.productTitle}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {item.variantTitle && <span>{item.variantTitle}</span>}
                              <span>Cant: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-sm font-medium flex-shrink-0">${Number(item.price)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">${total}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
