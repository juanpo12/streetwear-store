"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  )
}

function WishlistContent() {
  // Mock data - esto se reemplazará con datos reales de la base de datos
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Urban Hoodie Premium",
      price: 89.99,
      originalPrice: 109.99,
      image: "/placeholder.svg",
      category: "Hoodies",
      inStock: true
    },
    {
      id: 2,
      name: "Street Style Jacket",
      price: 129.99,
      originalPrice: null,
      image: "/placeholder.svg",
      category: "Jackets",
      inStock: true
    },
    {
      id: 3,
      name: "Vintage Tee Collection",
      price: 39.99,
      originalPrice: 49.99,
      image: "/placeholder.svg",
      category: "T-Shirts",
      inStock: false
    }
  ])

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id))
  }

  const addToCart = (id: number) => {
    // Aquí se implementaría la lógica para agregar al carrito
    console.log(`Adding item ${id} to cart`)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Lista de Deseos</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'} guardados
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tu lista de deseos está vacía</h3>
              <p className="text-muted-foreground text-center mb-4">
                Guarda productos que te gusten para encontrarlos fácilmente más tarde
              </p>
              <Button asChild>
                <Link href="/shop">Explorar Productos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group relative overflow-hidden">
                <div className="relative">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">Agotado</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {item.category}
                    </p>
                    
                    <h3 className="font-medium text-sm leading-tight">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!item.inStock}
                        onClick={() => addToCart(item.id)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        {item.inStock ? 'Agregar' : 'Agotado'}
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${item.id}`}>
                          Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {wishlistItems.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/shop">Continuar Comprando</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}