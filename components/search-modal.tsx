"use client"

import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

interface ApiResponse {
  success: boolean
  data: Product[]
  total: number
  query: string
  category?: string
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar productos iniciales cuando se abre el modal
  useEffect(() => {
    if (open && searchResults.length === 0) {
      fetchProducts()
    }
  }, [open])

  // Buscar productos cuando cambia la query
  useEffect(() => {
    if (!open) return

    if (!searchQuery.trim()) {
      fetchProducts()
      return
    }

    const timer = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, open])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products?limit=8')
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
      } else {
        setError('Error al cargar productos')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const searchProducts = async (query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
      } else {
        setError('Error en la búsqueda')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error searching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    fetchProducts()
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchQuery("")
    setSearchResults([])
    setError(null)
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-xl backdrop-blur-md bg-background/80 border-l border-border/20">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20 backdrop-blur-sm bg-background/60">
            <h2 className="text-streetwear-sm">SEARCH PRODUCTS</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-border/20 backdrop-blur-sm bg-background/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 backdrop-blur-sm bg-background/60 border-border/30"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-muted-foreground text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => searchQuery ? searchProducts(searchQuery) : fetchProducts()}
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? `No se encontraron productos para "${searchQuery}"` : "Escribe para buscar productos"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((product) => (
                  <div key={product.id} className="flex gap-3 p-3 rounded-lg border border-border/20 backdrop-blur-sm bg-background/40 hover:bg-background/60 transition-all duration-200 cursor-pointer group">
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <p className="text-sm font-semibold">${product.price}</p>
                    </div>
                    <div className="flex items-center">
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="p-4 border-t border-border/20 backdrop-blur-sm bg-background/60">
              <p className="text-xs text-muted-foreground text-center">
                {searchResults.length} producto{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                {searchQuery && ` para "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}