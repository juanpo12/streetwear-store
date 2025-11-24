"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearch } from "./search-provider"

interface Product {
  id: number
  name: string
  price: string
  image: string
  categoryName: string
  description: string
}

interface ApiResponse {
  success: boolean
  data: Product[]
  total: number
  query: string
}

export function SearchSidebar() {
  const { isOpen, closeSearch } = useSearch()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar productos iniciales
  const fetchInitialProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products?limit=6&excludeUncategorized=true')
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data || [])
      } else {
        setSearchResults([])
      }
    } catch (err) {
      setError('Error de conexión')
      setSearchResults([])
      console.error('Error fetching initial products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para buscar productos
  const searchProducts = async (query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10&excludeUncategorized=true`)
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
      } else {
        setError('Error en la búsqueda')
        setSearchResults([])
      }
    } catch (err) {
      setError('Error de conexión')
      setSearchResults([])
      console.error('Error searching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar productos iniciales cuando se abre el sidebar
  useEffect(() => {
    if (isOpen && searchResults.length === 0 && !searchQuery) {
      fetchInitialProducts()
    }
  }, [isOpen])

  // Buscar productos cuando cambia la query
  useEffect(() => {
    if (!isOpen) return

    if (!searchQuery.trim()) {
      fetchInitialProducts()
      return
    }

    const timer = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay with blur */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={closeSearch} />

      {/* Sidebar with glassmorphism */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50">
        <div className="h-full bg-background/80 backdrop-blur-xl border-l border-border/50 shadow-2xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/40">
              <h2 className="text-streetwear-sm">SEARCH</h2>
              <Button variant="ghost" size="icon" onClick={closeSearch}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-border/50 bg-background/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/60 backdrop-blur-sm border-border/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">Buscando productos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 text-sm">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => searchQuery ? searchProducts(searchQuery) : fetchInitialProducts()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : searchQuery === "" ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm">No hay productos disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-4">Productos recientes</p>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={closeSearch}
                        className="flex gap-4 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/30 hover:bg-background/60 hover:border-border/50 transition-all group"
                      >
                        <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                          <p className="text-sm font-semibold">{product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No se encontraron productos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-4">Resultados para &quot;{searchQuery}&quot;</p>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={closeSearch}
                      className="flex gap-4 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/30 hover:bg-background/60 hover:border-border/50 transition-all group"
                    >
                      <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                        <p className="text-sm font-semibold">{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
