"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag, Heart, Share2, Facebook, Twitter, MessageCircle, Copy, X, Star, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useFavorites } from "@/components/favorites-provider"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: string
  priceNumeric: number
  stock: number
  image: string
  images: { url: string; altText: string }[]
  category: string
  description: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  featured: boolean
  variants?: any[]
  compareAtPrice?: string
  compareAtPriceNumeric?: number
  onSale?: boolean
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, openCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
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
          const variants = data.data.variants || []
          const getSizeFromVariant = (v: any) => (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[0] : v.title
          const getColorFromVariant = (v: any) => (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[1] : ''
          const firstAvailableColor = (data.data.colors || []).find((c: string) => variants.some((v: any) => String(getColorFromVariant(v)).toLowerCase() === String(c).toLowerCase() && (v.inventoryQuantity || 0) > 0)) || (data.data.colors?.[0] || "")
          const firstAvailableSizeForColor = (data.data.sizes || []).find((s: string) => variants.some((v: any) => String(getSizeFromVariant(v)).toLowerCase() === String(s).toLowerCase() && String(getColorFromVariant(v)).toLowerCase() === String(firstAvailableColor).toLowerCase() && (v.inventoryQuantity || 0) > 0)) || (data.data.sizes?.[0] || "")
          setSelectedColor(firstAvailableColor)
          setSelectedSize(firstAvailableSizeForColor)
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
    
    // Encontrar la variante específica seleccionada
    const variants = product.variants || []
    const selectedVariant = variants.find((v: any) => {
      const titleSize = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[0] : v.title
      const titleColor = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[1] : ''
      return String(titleSize).toLowerCase() === String(selectedSize).toLowerCase() && 
             String(titleColor).toLowerCase() === String(selectedColor).toLowerCase()
    })
    
    // Determinar el stock disponible
    const availableStock = selectedVariant 
      ? selectedVariant.inventoryQuantity || 0
      : product.stock || 0
    
    // Verificar si hay stock disponible
    if (availableStock <= 0) {
      toast({
        title: "Sin stock disponible",
        description: `La talla ${selectedSize}${selectedColor ? ` en color ${selectedColor}` : ''} no está disponible en este momento.`,
        variant: "destructive",
      })
      return
    }
    
    setIsAddingToCart(true)
    const lineId = selectedVariant?.id ? `${product.id}:${selectedVariant.id}` : product.id
    addItem({
      id: lineId,
      productId: product.id,
      name: product.name,
      price: product.priceNumeric,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      variantId: selectedVariant?.id || null,
      stock: availableStock,
      allowOutOfStock: false,
    })
    
    setTimeout(() => {
      setIsAddingToCart(false)
      openCart()
    }, 600)
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

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - URBAN THREADS`,
          text: `¡Mira este increíble producto: ${product.name}!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    } else {
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

  const nextImage = () => {
    if (!product?.images) return
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product?.images) return
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-10 bg-muted/50 rounded-full w-24 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-muted/50 rounded-3xl"></div>
                <div className="grid grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted/50 rounded-2xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-10 bg-muted/50 rounded-xl w-3/4"></div>
                <div className="h-6 bg-muted/50 rounded-lg w-1/2"></div>
                <div className="h-8 bg-muted/50 rounded-lg w-1/3"></div>
                <div className="h-32 bg-muted/50 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-8 rounded-full hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="text-center py-24">
            <div className="inline-block p-8 rounded-3xl bg-muted/30 mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-8 text-lg">{error}</p>
            <Button onClick={() => router.push("/shop")} size="lg" className="rounded-full">
              Ir a la tienda
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 rounded-full hover:bg-muted/50 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            {/* Main Image with Navigation */}
            <div className="relative group aspect-square overflow-hidden rounded-3xl bg-muted/30 shadow-lg">
              <Image
                src={product.images && product.images.length > 0 
                  ? product.images[selectedImageIndex]?.url 
                  : product.image || "/placeholder.svg"}
                alt={product.images && product.images.length > 0 
                  ? product.images[selectedImageIndex]?.altText 
                  : product.name}
                width={700}
                height={700}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              
              {/* Image Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground shadow-lg backdrop-blur-sm rounded-full px-4 py-1.5">
                    ⭐ DESTACADO
                  </Badge>
                )}
                {product.onSale && (
                  <Badge className="bg-amber-500 text-white shadow-lg backdrop-blur-sm rounded-full px-4 py-1.5">
                    OFERTA
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="destructive" className="shadow-lg backdrop-blur-sm rounded-full px-4 py-1.5">
                    AGOTADO
                  </Badge>
                )}
              </div>

              {/* Image Counter */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-2xl bg-muted/30 border-3 transition-all duration-300 hover:scale-105 ${
                      selectedImageIndex === index 
                        ? 'border-primary shadow-lg ring-2 ring-primary ring-offset-2' 
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText}
                      width={150}
                      height={150}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 lg:pt-2">
            {/* Category Badge */}
            <div>
              <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full">
                {product.category}
              </Badge>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {product.name}
              </h1>
              
              {/* Rating (mock data) */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(124 reseñas)</span>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 border-2 border-muted">
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {product.price}
                  </div>
                  {product.onSale && product.compareAtPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      {product.compareAtPrice}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Impuestos incluidos
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold px-4 py-2 rounded-full ${
                  (((product.variants || []).reduce((sum: number, v: any) => sum + (v.inventoryQuantity || 0), 0)) || (product.stock || 0)) > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                  (((product.variants || []).reduce((sum: number, v: any) => sum + (v.inventoryQuantity || 0), 0)) || (product.stock || 0)) > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {(((product.variants || []).reduce((sum: number, v: any) => sum + (v.inventoryQuantity || 0), 0)) || (product.stock || 0)) > 0 
                    ? `${((product.variants || []).reduce((sum: number, v: any) => sum + (v.inventoryQuantity || 0), 0)) || (product.stock || 0)} disponibles` 
                    : 'Agotado'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-muted/20">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Selecciona tu talla</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => {
                    const variants = product.variants || []
                    const hasStock = variants.some((v: any) => {
                      const titleSize = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[0] : v.title
                      const titleColor = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[1] : ''
                      return String(titleSize).toLowerCase() === String(size).toLowerCase() && String(titleColor).toLowerCase() === String(selectedColor).toLowerCase() && (v.inventoryQuantity || 0) > 0
                    })
                    return (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="lg"
                        onClick={() => hasStock && setSelectedSize(size)}
                        disabled={!hasStock}
                        className={`min-w-[4rem] rounded-xl font-medium transition-all ${
                          selectedSize === size 
                            ? 'shadow-lg scale-105' 
                            : 'hover:scale-105 hover:border-primary/50'
                        } ${!hasStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {size}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Elige un color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const variants = product.variants || []
                    const hasStockColor = variants.some((v: any) => {
                      const titleColor = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[1] : ''
                      return String(titleColor).toLowerCase() === String(color).toLowerCase() && (v.inventoryQuantity || 0) > 0
                    })
                    return (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="lg"
                        onClick={() => {
                          if (!hasStockColor) return
                          setSelectedColor(color)
                          // Ajustar talla si la actual no tiene stock para el color elegido
                          const variants = product.variants || []
                          const currentHasStock = variants.some((v: any) => {
                            const titleSize = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[0] : v.title
                            const titleColor = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[1] : ''
                            return String(titleSize).toLowerCase() === String(selectedSize).toLowerCase() && String(titleColor).toLowerCase() === String(color).toLowerCase() && (v.inventoryQuantity || 0) > 0
                          })
                          if (!currentHasStock) {
                            const firstSizeForColor = (product.sizes || []).find((s: string) => variants.some((v: any) => {
                              const titleSize = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[0] : v.title
                              const titleColor = (v.title && v.title.includes(' / ')) ? v.title.split(' / ')[1] : ''
                              return String(titleSize).toLowerCase() === String(s).toLowerCase() && String(titleColor).toLowerCase() === String(color).toLowerCase() && (v.inventoryQuantity || 0) > 0
                            })) || selectedSize
                            setSelectedSize(firstSizeForColor)
                          }
                        }}
                        disabled={!hasStockColor}
                        className={`rounded-xl font-medium transition-all ${
                          selectedColor === color 
                            ? 'shadow-lg scale-105' 
                            : 'hover:scale-105 hover:border-primary/50'
                        } ${!hasStockColor ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {color}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                size="lg" 
                className={`w-full bg-primary hover:bg-accent gap-2 h-14 rounded-xl text-base font-semibold shadow-lg transition-all ${
                  isAddingToCart ? 'scale-95' : 'hover:scale-105'
                }`}
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {isAddingToCart ? "AGREGANDO..." : product.inStock ? "AGREGAR AL CARRITO" : "AGOTADO"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 rounded-xl font-medium hover:scale-105 transition-all"
                  onClick={handleToggleFavorite}
                >
                  <Heart 
                    className={`h-5 w-5 mr-2 transition-all ${
                      isFavorite(parseInt(product.id)) 
                        ? "fill-red-500 text-red-500 scale-110" 
                        : ""
                    }`} 
                  />
                  Favoritos
                </Button>
                <div className="relative" ref={shareMenuRef}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12 rounded-xl font-medium hover:scale-105 transition-all"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Compartir
                  </Button>
                  
                  {showShareOptions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 rounded-2xl shadow-2xl z-50 p-3 backdrop-blur-xl">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b">
                        <span className="font-semibold">Compartir producto</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowShareOptions(false)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start rounded-xl hover:bg-muted transition-all"
                          onClick={shareToFacebook}
                        >
                          <Facebook className="h-5 w-5 mr-3 text-blue-600" />
                          Facebook
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start rounded-xl hover:bg-muted transition-all"
                          onClick={shareToTwitter}
                        >
                          <Twitter className="h-5 w-5 mr-3 text-blue-400" />
                          Twitter
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start rounded-xl hover:bg-muted transition-all"
                          onClick={shareToWhatsApp}
                        >
                          <MessageCircle className="h-5 w-5 mr-3 text-green-600" />
                          WhatsApp
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start rounded-xl hover:bg-muted transition-all"
                          onClick={copyToClipboard}
                        >
                          <Copy className="h-5 w-5 mr-3" />
                          Copiar enlace
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Cards */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <Card className="p-4 text-center rounded-2xl border-2 hover:shadow-lg transition-all hover:scale-105">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xs font-medium">Envío gratis</div>
              </Card>
              <Card className="p-4 text-center rounded-2xl border-2 hover:shadow-lg transition-all hover:scale-105">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xs font-medium">Compra segura</div>
              </Card>
              <Card className="p-4 text-center rounded-2xl border-2 hover:shadow-lg transition-all hover:scale-105">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xs font-medium">10 días devolución</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}