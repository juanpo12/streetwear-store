"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import { useCart } from "./cart-provider"
import { ProductModal } from "./product-modal"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const [showQuickBuy, setShowQuickBuy] = useState(false)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    openCart()
  }

  return (
    <>
      <Card className="group overflow-hidden border-0 shadow-none">
        <div className="aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{product.category}</div>
          <h3 className="font-semibold text-lg tracking-tight">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">${product.price}</span>
            <Button size="sm" className="bg-primary hover:bg-accent gap-2" onClick={() => setShowQuickBuy(true)}>
              <ShoppingBag className="h-4 w-4" />
              BUY
            </Button>
          </div>
        </div>
      </Card>

      <ProductModal product={product} open={showQuickBuy} onOpenChange={setShowQuickBuy} />
    </>
  )
}
