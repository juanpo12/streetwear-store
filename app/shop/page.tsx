"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"

// Mock data - replace with real data later
const allProducts = [
  {
    id: 1,
    name: "OVERSIZED HOODIE",
    price: 89,
    image: "/oversized-black-hoodie-streetwear.png",
    category: "HOODIES",
  },
  {
    id: 2,
    name: "BOXY TEE",
    price: 45,
    image: "/boxy-fit-white-t-shirt-streetwear.jpg",
    category: "TEES",
  },
  {
    id: 3,
    name: "CARGO PANTS",
    price: 120,
    image: "/wide-cargo-pants-streetwear-urban.jpg",
    category: "BOTTOMS",
  },
  {
    id: 4,
    name: "BOMBER JACKET",
    price: 150,
    image: "/black-bomber-streetwear.png",
    category: "JACKETS",
  },
  {
    id: 5,
    name: "BUCKET HAT",
    price: 35,
    image: "/black-bucket-hat-streetwear.jpg",
    category: "ACCESSORIES",
  },
  {
    id: 6,
    name: "TRACK PANTS",
    price: 85,
    image: "/black-track-pants-streetwear.jpg",
    category: "BOTTOMS",
  },
]

const categories = ["ALL", "HOODIES", "TEES", "BOTTOMS", "JACKETS", "ACCESSORIES"]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  const filteredProducts =
    selectedCategory === "ALL" ? allProducts : allProducts.filter((product) => product.category === selectedCategory)

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
              onClick={() => setSelectedCategory(category)} // Added onClick handler
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(
            (
              product, // Using filtered products instead of all products
            ) => (
              <ProductCard key={product.id} product={product} />
            ),
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            LOAD MORE PRODUCTS
          </Button>
        </div>
      </div>
    </div>
  )
}
