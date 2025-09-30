"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag, Heart, Share2, Facebook, Twitter, MessageCircle, Copy, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useFavorites } from "@/components/favorites-provider"

interface Product {
  id: string
  name: string
  price: string
  priceNumeric: number
  image: string
  category: string
  description: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  featured: boolean
  variants?: any[]
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, openCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setProduct(data.data)
          setSelectedSize(data.data.sizes[0] || "")
          setSelectedColor(data.data.colors[0] || "")
        } else {
          setError(data.error || "Producto no encontrado")
        }
      } catch (err) {
        setError("Error al cargar el producto")
        console.error("Error fetching product:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareOptions(false)
      }
    }

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareOptions])

  const handleAddToCart = () => {
    if (!product) return
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.priceNumeric,
      image: product.image,
      size: selectedSize,
      // color: selectedColor, // removed to match CartItem type
    })
    openCart()
  }

  const handleToggleFavorite = () => {
    if (!product) return
    
    const productForFavorites = {
      id: parseInt(product.id),
      name: product.name,
      price: product.priceNumeric,
      image: product.image,
      category: product.category,
      description: product.description,
      sizes: product.sizes,
      colors: product.colors,
      inStock: product.inStock,
      featured: product.featured
    }
    
    if (isFavorite(parseInt(product.id))) {
      removeFromFavorites(parseInt(product.id))
    } else {
      addToFavorites(productForFavorites)
    }
  }

  const handleShare = async () => {
    if (!product) return

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - URBAN THREADS`,
          text: `¡Mira este increíble producto: ${product.name}!`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled the share or error occurred
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: show manual share options
      setShowShareOptions(!showShareOptions)
    }
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`¡Mira este increíble producto: ${product?.name}!`)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank')
    setShowShareOptions(false)
  }

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`¡Mira este increíble producto: ${product?.name}! ${window.location.href}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    setShowShareOptions(false)
  }

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`¡Mira este increíble producto: ${product?.name}! ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShowShareOptions(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles!')
      setShowShareOptions(false)
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
      alert('Error al copiar el enlace')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={() => router.push("/shop")}>
              Ir a la tienda
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category & Status */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
              {product.featured && (
                <Badge variant="default" className="text-xs">
                  DESTACADO
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="destructive" className="text-xs">
                  AGOTADO
                </Badge>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

            {/* Price */}
            <div className="text-2xl font-bold">{product.price}</div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className="min-w-[3rem]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-accent gap-2"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="h-5 w-5" />
                {product.inStock ? "AGREGAR AL CARRITO" : "AGOTADO"}
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleToggleFavorite}
                >
                  <Heart 
                    className={`h-4 w-4 mr-2 ${
                      isFavorite(parseInt(product.id)) 
                        ? "fill-red-500 text-red-500" 
                        : ""
                    }`} 
                  />
                  {isFavorite(parseInt(product.id)) ? "En Favoritos" : "Favoritos"}
                </Button>
                <div className="relative flex-1" ref={shareMenuRef}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  
                  {/* Share Options Dropdown */}
                  {showShareOptions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-2">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b">
                        <span className="text-sm font-medium">Compartir producto</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowShareOptions(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={shareToFacebook}
                        >
                          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                          Facebook
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={shareToTwitter}
                        >
                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          Twitter
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={shareToWhatsApp}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                          WhatsApp
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={copyToClipboard}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar enlace
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <Card className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibilidad:</span>
                  <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                    {product.inStock ? "En stock" : "Agotado"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}