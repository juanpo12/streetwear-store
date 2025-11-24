"use client"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Product {
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

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?featured=true&limit=4')
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured products')
        }
        
        const data = await response.json()
        setFeaturedProducts(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-streetwear-lg mb-4">DESTACADOS</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Las últimas piezas de nuestra colección: audaces, cómodas y pensadas para la calle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-streetwear-lg mb-4">DESTACADOS</h2>
            <p className="text-red-500">Error al cargar productos destacados: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-streetwear-lg mb-4 tracking-tight">DESTACADOS</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Las últimas piezas de nuestra colección: audaces, cómodas y pensadas para la calle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tienda" aria-label="Ver todos los productos">VER TODOS LOS PRODUCTOS</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
