"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearch } from "./search-provider"

// Mock products data - will come from Supabase later
const allProducts = [
  { id: 1, name: "OVERSIZED HOODIE", price: 89, image: "/oversized-black-hoodie-streetwear.png", category: "HOODIES" },
  { id: 2, name: "BOXY TEE", price: 45, image: "/boxy-fit-white-t-shirt-streetwear.jpg", category: "TEES" },
  { id: 3, name: "CARGO PANTS", price: 95, image: "/baggy-cargo-pants-streetwear.jpg", category: "BOTTOMS" },
  { id: 4, name: "DENIM JACKET", price: 120, image: "/cropped-denim-jacket-streetwear.jpg", category: "JACKETS" },
  { id: 5, name: "GRAPHIC TEE", price: 42, image: "/graphic-t-shirt-streetwear-urban.jpg", category: "TEES" },
  { id: 6, name: "DISTRESSED JEANS", price: 85, image: "/distressed-jeans-streetwear.jpg", category: "BOTTOMS" },
]

export function SearchSidebar() {
  const { isOpen, closeSearch } = useSearch()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
              {searchQuery === "" ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-sm">Start typing to search products</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No products found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop`}
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
                        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                        <p className="text-sm font-semibold">${product.price}</p>
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
