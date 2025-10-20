"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 12

const ShopPage: React.FC = () => {
  const { products, loading, error, fetchProducts } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState<number>(1)

  const allProducts = products || []

  const categories = useMemo(() => {
    const cats = new Set<string>(["ALL"])
    for (const p of allProducts) if (p.category) cats.add(p.category)
    return Array.from(cats)
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") return allProducts
    return allProducts.filter((p: any) => p.category === selectedCategory)
  }, [selectedCategory, allProducts])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchProducts()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Categorías */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
              selectedCategory === cat
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-gray-600 hover:text-primary hover:border-primary/50"
            )}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Productos */}
      {paginatedProducts.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay productos para mostrar.</p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {paginatedProducts.map((product: any) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors",
                  currentPage === i + 1
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default ShopPage
