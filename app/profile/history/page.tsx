"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Calendar } from "lucide-react"
import Link from "next/link"

interface PurchaseItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  size: string
}

interface Purchase {
  id: string
  date: string
  total: number
  status: "completed" | "processing" | "cancelled"
  items: PurchaseItem[]
}

// Mock data - esto se conectará con Supabase más adelante
const mockPurchases: Purchase[] = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    total: 180,
    status: "completed",
    items: [
      {
        id: 1,
        name: "BOXY TEE",
        price: 45,
        quantity: 2,
        image: "/boxy-fit-white-t-shirt-streetwear.jpg",
        size: "M",
      },
      {
        id: 2,
        name: "OVERSIZED HOODIE",
        price: 90,
        quantity: 1,
        image: "/oversized-black-hoodie-streetwear.png",
        size: "L",
      },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-10",
    total: 120,
    status: "completed",
    items: [
      {
        id: 3,
        name: "CARGO PANTS",
        price: 120,
        quantity: 1,
        image: "/baggy-cargo-pants-streetwear.jpg",
        size: "32",
      },
    ],
  },
]

export default function PurchaseHistoryPage() {
  const [purchases] = useState<Purchase[]>(mockPurchases)

  const getStatusColor = (status: Purchase["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "processing":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    }
  }

  const getStatusText = (status: Purchase["status"]) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "processing":
        return "Procesando"
      case "cancelled":
        return "Cancelado"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold tracking-tight">Historial de Compras</h1>
          </div>
          <p className="text-muted-foreground">
            {purchases.length === 0
              ? "Aún no has realizado ninguna compra"
              : `Tienes ${purchases.length} ${purchases.length === 1 ? "compra" : "compras"} registradas`}
          </p>
        </div>

        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/20 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No hay compras todavía</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Cuando realices tu primera compra, aparecerá aquí con todos los detalles
            </p>
            <Button asChild className="bg-primary hover:bg-accent">
              <Link href="/shop">Explorar Productos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Orden {purchase.id}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(purchase.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(purchase.status)}>
                        {getStatusText(purchase.status)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-2xl font-bold">${purchase.total}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {purchase.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{item.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Talle: {item.size}</span>
                            <span>Cantidad: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold">${item.price}</div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-muted-foreground">${item.price * item.quantity} total</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
