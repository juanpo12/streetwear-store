"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

type AdminOrderDetail = {
  id: string
  orderNumber: string
  email: string
  phone: string | null
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotalPrice: string
  totalTax: string
  totalShipping: string
  totalPrice: string
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  customerName: string | null
  items: Array<{
    id: string
    productId: string
    variantId: string | null
    quantity: number
    price: string
    totalPrice: string
    productTitle: string
    variantTitle: string | null
    imageUrl: string
  }>
  shippingAddress: null | {
    firstName: string
    lastName: string
    company: string | null
    address1: string
    address2: string | null
    city: string
    province: string | null
    country: string
    zip: string
    phone: string | null
  }
  billingAddress: AdminOrderDetail["shippingAddress"]
}

const getStatusColor = (status: string) => {
  const s = (status || "").toLowerCase()
  switch (s) {
    case "delivered":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    case "shipped":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    case "confirmed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    case "pending":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    case "cancelled":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function AdminOrderDetailPage() {
  const { isAdmin, adminLoading } = useAdmin()
  const params = useParams<{ orderId: string }>()
  const orderId = params?.orderId
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState({ status: false, paymentStatus: false, fulfillmentStatus: false })
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      if (adminLoading) return
      if (!isAdmin) {
        setError("No autorizado")
        setLoading(false)
        return
      }
      if (!orderId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        const json = await res.json()
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || `Error ${res.status}`)
        }
        setDetail(json.data)
      } catch (e: any) {
        setError(e.message || "Error cargando orden")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId, isAdmin, adminLoading])

  async function patchOrder(partial: Partial<Pick<AdminOrderDetail, "status" | "paymentStatus" | "fulfillmentStatus">>) {
    if (!orderId) return
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Error ${res.status}`)
      }
      setDetail((d) => (d ? { ...d, ...json.data } : d))
      toast({ title: "Actualizado", description: "Estado de la orden actualizado." })
    } catch (e: any) {
      toast({ title: "Error al actualizar", description: e.message || "Intenta nuevamente", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <h1 className="text-streetwear-lg">Detalle de Orden</h1>
          </div>
          <div>
            <Button variant="outline" onClick={() => detail && exportCSV(detail)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
          </div>
        ) : detail ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Orden {detail.orderNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className={getStatusColor(detail.status)}>Estado: {detail.status}</Badge>
                  <Badge variant="outline">Pago: {detail.paymentStatus}</Badge>
                  <Badge variant="outline">Cumplimiento: {detail.fulfillmentStatus}</Badge>
                </div>
                {/* Controles de actualización de estado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">Cambiar estado</span>
                    <Select
                      value={detail.status}
                      onValueChange={async (v) => {
                        setUpdating((u) => ({ ...u, status: true }))
                        await patchOrder({ status: v })
                        setUpdating((u) => ({ ...u, status: false }))
                      }}
                      disabled={updating.status}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">Estado de pago</span>
                    <Select
                      value={detail.paymentStatus}
                      onValueChange={async (v) => {
                        setUpdating((u) => ({ ...u, paymentStatus: true }))
                        await patchOrder({ paymentStatus: v })
                        setUpdating((u) => ({ ...u, paymentStatus: false }))
                      }}
                      disabled={updating.paymentStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="paid">Pagado</SelectItem>
                        <SelectItem value="failed">Fallido</SelectItem>
                        <SelectItem value="refunded">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">Cumplimiento</span>
                    <Select
                      value={detail.fulfillmentStatus}
                      onValueChange={async (v) => {
                        setUpdating((u) => ({ ...u, fulfillmentStatus: true }))
                        await patchOrder({ fulfillmentStatus: v })
                        setUpdating((u) => ({ ...u, fulfillmentStatus: false }))
                      }}
                      disabled={updating.fulfillmentStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfulfilled">Sin cumplir</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="fulfilled">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Cliente</div>
                    <div className="font-medium">{detail.customerName || "—"}</div>
                    <div className="text-muted-foreground">{detail.email}</div>
                    {detail.phone && <div className="text-muted-foreground">Tel: {detail.phone}</div>}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Totales</div>
                    <div>Subtotal: ${detail.subtotalPrice}</div>
                    <div>Envío: ${detail.totalShipping}</div>
                    <div>Impuestos: ${detail.totalTax}</div>
                    <div className="font-semibold">Total: ${detail.totalPrice} {detail.currency}</div>
                  </div>
                </div>
                {detail.notes && (
                  <div className="mt-4 text-sm">
                    <div className="text-muted-foreground">Notas</div>
                    <div>{detail.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Línea de tiempo */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Pedido creado</div>
                      <div className="text-muted-foreground">{new Date(detail.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Última actualización</div>
                      <div className="text-muted-foreground">{new Date(detail.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Estado</div>
                      <div className="text-muted-foreground">{detail.status}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Pago</div>
                      <div className="text-muted-foreground">{detail.paymentStatus}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Cumplimiento</div>
                      <div className="text-muted-foreground">{detail.fulfillmentStatus}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Direcciones */}
            <Card>
              <CardHeader>
                <CardTitle>Direcciones</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Envío</div>
                  {detail.shippingAddress ? (
                    <address className="not-italic">
                      {detail.shippingAddress.firstName} {detail.shippingAddress.lastName}
                      <br />
                      {detail.shippingAddress.address1}
                      {detail.shippingAddress.address2 ? `, ${detail.shippingAddress.address2}` : ""}
                      <br />
                      {detail.shippingAddress.city}, {detail.shippingAddress.province || ""} {detail.shippingAddress.zip}
                      <br />
                      {detail.shippingAddress.country}
                    </address>
                  ) : (
                    <div>—</div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-muted-foreground mb-1">Facturación</div>
                  {detail.billingAddress ? (
                    <address className="not-italic">
                      {detail.billingAddress.firstName} {detail.billingAddress.lastName}
                      <br />
                      {detail.billingAddress.address1}
                      {detail.billingAddress.address2 ? `, ${detail.billingAddress.address2}` : ""}
                      <br />
                      {detail.billingAddress.city}, {detail.billingAddress.province || ""} {detail.billingAddress.zip}
                      <br />
                      {detail.billingAddress.country}
                    </address>
                  ) : (
                    <div>—</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Variante</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded overflow-hidden bg-muted">
                              <Image src={it.imageUrl || "/placeholder.svg"} alt={it.productTitle} fill className="object-cover" />
                            </div>
                            <div>
                              <div className="font-medium">{it.productTitle}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{it.variantTitle || "—"}</TableCell>
                        <TableCell>{it.quantity}</TableCell>
                        <TableCell>${it.price}</TableCell>
                        <TableCell className="font-semibold">${it.totalPrice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>No se encontró la orden.</div>
        )}
      </div>
    </div>
  )
}

function exportCSV(detail: AdminOrderDetail) {
  const headers = [
    "orderNumber","customerName","email","status","paymentStatus","fulfillmentStatus","subtotal","shipping","tax","total","createdAt"
  ]
  const escape = (val: any) => '"' + String(val ?? '').replace(/"/g, '""') + '"'
  const row = [
    escape(detail.orderNumber),
    escape(detail.customerName ?? ''),
    escape(detail.email),
    escape(detail.status),
    escape(detail.paymentStatus),
    escape(detail.fulfillmentStatus),
    escape(detail.subtotalPrice),
    escape(detail.totalShipping),
    escape(detail.totalTax),
    escape(detail.totalPrice),
    escape(detail.createdAt),
  ].join(',')
  const itemsHeader = ["productTitle","variantTitle","quantity","price","totalPrice"]
  const itemsRows = detail.items.map(it => [
    escape(it.productTitle),
    escape(it.variantTitle ?? ''),
    escape(it.quantity),
    escape(it.price),
    escape(it.totalPrice),
  ].join(','))
  const csv = [headers.join(','), row, '', itemsHeader.join(','), ...itemsRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `order-${detail.orderNumber}.csv`
  a.click()
  URL.revokeObjectURL(url)
}