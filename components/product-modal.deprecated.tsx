"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { useCart } from "./cart-provider"

interface ColorVariant {
  id: number
  name: string
  image: string
}

interface ProductModalProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState("M")
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)
  const { addItem, openCart } = useCart()

  const colorVariants: ColorVariant[] = [
    { id: product.id, name: "Black", image: product.image },
    {
      id: product.id + 100,
      name: "White",
      image: "/boxy-fit-white-t-shirt-streetwear.jpg",
    },
    {
      id: product.id + 200,
      name: "Gray",
      image: "/oversized-black-hoodie-streetwear.png",
    },
  ]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta))
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: colorVariants[selectedColor].id,
        name: `${product.name} - ${colorVariants[selectedColor].name} - ${selectedSize}`,
        price: product.price,
        image: colorVariants[selectedColor].image,
      })
    }
    onOpenChange(false)
    openCart()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr] gap-0">
          {/* Product Image */}
          <div className="relative bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
              <Image
                src={colorVariants[selectedColor].image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover drop-shadow-2xl rounded-lg"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col bg-background">
            {/* Product Name */}
            <h2 className="text-3xl font-bold mb-4 text-balance">{product.name}</h2>

            {/* Price */}
            <div className="text-4xl font-bold mb-8 text-primary">${product.price.toLocaleString()}</div>

            {/* Color Selector */}
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3 uppercase tracking-wider">MODELOS</div>
              <div className="flex gap-3">
                {colorVariants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedColor(index)}
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedColor === index
                        ? "border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={variant.image || "/placeholder.svg"}
                      alt={variant.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3 uppercase tracking-wider">TALLE</div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="min-w-[3.5rem] font-semibold"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <div className="text-sm font-semibold mb-3 uppercase tracking-wider">CANTIDAD</div>
              <div className="flex items-center gap-4 border-2 border-border rounded-lg w-fit">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-12 w-12 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[2.5rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  className="h-12 w-12 hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full text-base font-bold uppercase tracking-wider h-14 shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              AGREGAR AL CARRITO
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
