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
import { useMemo, useState, useEffect } from "react"

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

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<string | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 250)
    return () => clearTimeout(id)
  }, [searchTerm])

  const rangeStart = useMemo(() => {
    const now = new Date()
    switch (dateRange) {
      case "today":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      case "week": {
        const d = new Date(now)
        d.setDate(now.getDate() - 7)
        return d
      }
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1)
      case "quarter": {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
        return new Date(now.getFullYear(), quarterStartMonth, 1)
      }
      default:
        return null
    }
  }, [dateRange])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = debouncedSearch
        ? [o.id, o.orderNumber, o.customerName || "", o.email]
            .join(" \n ")
            .toLowerCase()
            .includes(debouncedSearch)
        : true
      const matchesStatus = statusFilter === "all" ? true : o.status === statusFilter
      const matchesDate = rangeStart ? new Date(o.createdAt) >= rangeStart : true
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, debouncedSearch, statusFilter, rangeStart])

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
            <Button variant="outline" onClick={() => handleExportCSV(filteredOrders)}>
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
                  <Input
                    placeholder="Buscar por ID de orden, cliente o email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
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
              <Select value={dateRange ?? "all"} onValueChange={(v) => setDateRange(v === "all" ? null : v)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Rango de fechas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
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
                {filteredOrders.map((order) => (
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
                          <Link href={`/admin/orders/${order.id}`}>
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

function handleExportCSV(rows: Array<{
  id: string
  orderNumber: string
  customerName: string | null
  email: string
  itemsCount: number
  totalPrice: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  createdAt: string
}>) {
  const headers = [
    "id",
    "orderNumber",
    "customerName",
    "email",
    "itemsCount",
    "totalPrice",
    "status",
    "paymentStatus",
    "fulfillmentStatus",
    "createdAt",
  ]
  const escape = (val: any) => {
    const s = String(val ?? "")
    // Encerrar en comillas dobles y escapar comillas internas
    return '"' + s.replace(/"/g, '""') + '"'
  }
  const csv = [
    headers.join(','),
    ...rows.map((r) => [
      escape(r.id),
      escape(r.orderNumber),
      escape(r.customerName ?? ''),
      escape(r.email),
      escape(r.itemsCount),
      escape(r.totalPrice),
      escape(r.status),
      escape(r.paymentStatus),
      escape(r.fulfillmentStatus),
      escape(r.createdAt),
    ].join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
