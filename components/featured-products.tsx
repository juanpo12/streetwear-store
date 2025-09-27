import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data - replace with real data later
const featuredProducts = [
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
]

export function FeaturedProducts() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-streetwear-lg mb-4">FEATURED DROPS</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The latest pieces from our collection. Bold, comfortable, and designed for the streets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/shop">VIEW ALL PRODUCTS</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
