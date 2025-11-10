"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "./use-admin"

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  email: string
  customerName: string | null
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  totalPrice: string
  createdAt: string
  itemsCount: number
}

export function useAdminOrders() {
  const { isAdmin, adminLoading } = useAdmin()
  const [orders, setOrders] = useState<AdminOrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    if (adminLoading) return
    if (!isAdmin) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders`)
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Error ${res.status}`)
      }
      setOrders(json.data || [])
    } catch (e: any) {
      setError(e.message || "Error cargando órdenes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminLoading, isAdmin])

  const updateOrderStatus = async (
    orderId: string,
    payload: Partial<Pick<AdminOrderListItem, "status" | "paymentStatus" | "fulfillmentStatus">>
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Error ${res.status}`)
      }
      // Optimistic update
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...payload } : o)))
      return json.data
    } catch (e: any) {
      setError(e.message || "Error actualizando estado")
      throw e
    }
  }

  return { orders, loading, error, refresh: fetchOrders, updateOrderStatus }
}