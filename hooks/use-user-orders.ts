"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./use-auth"

interface OrderItemDTO {
  id: string
  quantity: number
  price: string
  totalPrice: string
  productTitle: string
  variantTitle: string | null
  productId: string
  variantId: string | null
}

interface AddressDTO {
  id: string
  type: string | null
  firstName: string | null
  lastName: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  country: string | null
  zip: string | null
  phone: string | null
}

export interface UserOrderDTO {
  id: string
  orderNumber: string
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
  items: OrderItemDTO[]
  addresses: AddressDTO[]
}

export function useUserOrders() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<UserOrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) return
      if (!isAuthenticated || !user?.id) {
        setOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/user/${user.id}/orders`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Error ${res.status}`)
        }
        const json = await res.json()
        setOrders(json.data || [])
      } catch (e: any) {
        setError(e.message || "Error cargando órdenes")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [authLoading, isAuthenticated, user?.id])

  return { orders, loading, error }
}