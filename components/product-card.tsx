"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Heart } from "lucide-react"
import { useFavorites } from "@/components/favorites-provider"

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
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const isProductFavorite = isFavorite(product.id)

  const handleBuyClick = (e: React.MouseEvent) => {
    // Permitir que el Link padre maneje la navegación
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProductFavorite) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden border-0 shadow-none cursor-pointer transition-all hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {/* Favorites Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isProductFavorite 
                  ? "fill-red-500 text-red-500" 
                  : "text-muted-foreground hover:text-red-500"
              }`} 
            />
          </Button>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{product.category}</div>
          <h3 className="font-semibold text-lg tracking-tight">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">${product.price}</span>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-accent gap-2" 
              onClick={handleBuyClick}
            >
              <ShoppingBag className="h-4 w-4" />
              BUY
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
