"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  featured: boolean
}

const categories = ["ALL", "HOODIES", "TEES", "BOTTOMS", "JACKETS", "ACCESSORIES"]
const PRODUCTS_PER_PAGE = 8

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setAllProducts(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts =
    selectedCategory === "ALL" ? allProducts : allProducts.filter((product) => product.category === selectedCategory)

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Resetear página cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-streetwear-lg mb-4">ALL PRODUCTS</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our complete collection of premium streetwear pieces.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-streetwear-lg mb-4">ALL PRODUCTS</h1>
            <p className="text-red-500">Error loading products: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-streetwear-lg mb-4">ALL PRODUCTS</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our complete collection of premium streetwear pieces.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              className="text-sm font-medium"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          ) : (
            currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Botón anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ←
            </Button>

            {/* Botones de páginas */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}

            {/* Botón siguiente */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
