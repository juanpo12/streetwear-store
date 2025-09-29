"use client"

import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Oversized Black Hoodie",
    price: 89,
    image: "/oversized-black-hoodie-streetwear.png",
    category: "Hoodies"
  },
  {
    id: 2,
    name: "Cargo Pants",
    price: 129,
    image: "/cargo-pants.png",
    category: "Pants"
  },
  {
    id: 3,
    name: "Bomber Jacket",
    price: 159,
    image: "/bomber-jacket-streetwear.jpg",
    category: "Jackets"
  },
  {
    id: 4,
    name: "Graphic T-Shirt",
    price: 45,
    image: "/graphic-t-shirt-streetwear-urban.jpg",
    category: "T-Shirts"
  },
  {
    id: 5,
    name: "Wide Leg Jeans",
    price: 119,
    image: "/wide-leg-jeans-streetwear.jpg",
    category: "Jeans"
  },
  {
    id: 6,
    name: "Black Bucket Hat",
    price: 35,
    image: "/black-bucket-hat-streetwear.jpg",
    category: "Accessories"
  }
]

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(mockProducts)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(mockProducts)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults(mockProducts)
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => onOpenChange(false)} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-xl backdrop-blur-md bg-background/80 border-l border-border/20">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20 backdrop-blur-sm bg-background/60">
            <h2 className="text-streetwear-sm">SEARCH PRODUCTS</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? `No products found for "${searchQuery}"` : "Start typing to search products"}
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
                        View
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
                {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}