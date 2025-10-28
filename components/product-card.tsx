"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Heart, Eye, Star, TrendingUp, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/components/favorites-provider"

interface ProductCardProps {
  product: {
    id: string | number
    name: string
    price: string | number
    image: string
    category: string
    featured?: boolean
    inStock?: boolean
    compareAtPrice?: string
    onSale?: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const isProductFavorite = isFavorite(Number(product.id))
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleBuyClick = (e: React.MouseEvent) => {
    // Permitir que el Link padre maneje la navegación
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProductFavorite) {
      removeFromFavorites(Number(product.id))
    } else {
      // Normalizar para favoritos: precio numérico si es posible
      const normalized = {
        id: Number(product.id),
        name: product.name,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
        image: product.image,
        category: product.category,
      }
      addToFavorites(normalized)
    }
  }

  const formattedPrice = typeof product.price === 'number' ? `$${product.price}` : product.price

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden border-2 border-transparent hover:border-primary/20 shadow-none cursor-pointer transition-all duration-300 hover:shadow-2xl rounded-3xl bg-card">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60 relative">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={500}
            height={500}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-lg rounded-full px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Destacado
              </Badge>
            )}
            {product.onSale && (
              <Badge className="bg-amber-500/90 backdrop-blur-sm text-white border-0 shadow-lg rounded-full px-3 py-1">
                <Tag className="h-3 w-3 mr-1" />
                Oferta
              </Badge>
            )}
            {product.inStock === false && (
              <Badge variant="destructive" className="backdrop-blur-sm border-0 shadow-lg rounded-full px-3 py-1">
                Agotado
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Favorites Button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm shadow-lg transition-all hover:scale-110 border-2 border-transparent hover:border-primary/20"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`h-4 w-4 transition-all ${
                  isProductFavorite 
                    ? "fill-red-500 text-red-500 scale-110" 
                    : "text-muted-foreground"
                }`} 
              />
            </Button>

            {/* Quick View Button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 border-2 border-transparent hover:border-primary/20"
              onClick={handleBuyClick}
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Bottom Quick Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              size="lg" 
              className="w-full bg-background/95 hover:bg-background backdrop-blur-sm text-foreground hover:text-primary shadow-lg rounded-xl font-semibold border-2 border-transparent hover:border-primary/20 transition-all" 
              onClick={handleBuyClick}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-3">
          {/* Category */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wider rounded-full px-3 py-1">
              {product.category}
            </Badge>
            {/* Rating (mock) */}
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-muted-foreground">4.8</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-lg tracking-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
            {product.name}
          </h3>

          {/* Price and Buy Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formattedPrice}
                </span>
                {product.onSale && product.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.compareAtPrice}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Envío incluido
              </div>
            </div>
            <Button 
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-accent shadow-lg hover:shadow-xl transition-all hover:scale-110" 
              onClick={handleBuyClick}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 pt-1">
            <div className={`h-2 w-2 rounded-full ${
              product.inStock === false ? 'bg-red-500' : 'bg-green-500'
            } animate-pulse`} />
            <span className="text-xs text-muted-foreground">
              {product.inStock === false ? 'Sin stock' : 'Disponible'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}