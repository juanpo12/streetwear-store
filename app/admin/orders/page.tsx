"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye, Package, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAdminOrders } from "@/hooks/use-admin-orders"
import { useAdmin } from "@/hooks/use-admin"

const getStatusColor = (status: string) => {
  const s = status.toLowerCase()
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

export default function OrdersPage() {
  const { isAdmin, adminLoading } = useAdmin()
  const { orders, loading, error, updateOrderStatus, refresh } = useAdminOrders()
  const isLoading = adminLoading || loading

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, { status })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-streetwear-lg">Gestión de Órdenes</h1>
            <p className="text-muted-foreground">Seguimiento y actualización del estado de pedidos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button asChild>
              <Link href="/admin">
                <Package className="h-4 w-4 mr-2" />
                Panel
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Últimas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">Requieren acción</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${orders.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total listado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${orders.length ? Math.round((orders.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0) / orders.length) * 100) / 100 : 0}
              </div>
              <p className="text-xs text-muted-foreground">Estimación</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por ID de orden, cliente o email..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Rango de fechas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Órdenes recientes</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refresh()}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Refrescar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName || "—"}</div>
                        <div className="text-sm text-muted-foreground">{order.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.itemsCount} items</TableCell>
                    <TableCell>${Number(order.totalPrice)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                        <Select onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Cambiar estado" />
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
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
