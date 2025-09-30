"use client"

import { useFavorites } from "@/components/favorites-provider"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-accent fill-accent" />
            <h1 className="text-4xl font-bold tracking-tight">Mis Favoritos</h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length === 0
              ? "Aún no tienes productos favoritos"
              : `Tienes ${favorites.length} ${favorites.length === 1 ? "producto favorito" : "productos favoritos"}`}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-24 w-24 text-muted-foreground/20 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No hay favoritos todavía</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Explora nuestra colección y guarda tus productos favoritos para encontrarlos fácilmente más tarde
            </p>
            <Button asChild className="bg-primary hover:bg-accent">
              <Link href="/shop">Explorar Productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
