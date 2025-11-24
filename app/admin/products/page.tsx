"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Upload, X, Star, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useProducts } from "@/hooks/use-products"



export default function AdminProductsPage() {
  const { products: productsList, loading, error, fetchProducts } = useProducts()
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [adminFilter, setAdminFilter] = useState<'all'|'uncategorized'|'out_of_stock'|'low_stock'>('all')
  const [noCategoryCount, setNoCategoryCount] = useState<number>(0)
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0)
  const [lowStockCount, setLowStockCount] = useState<number>(0)

  useEffect(() => {
    // Fetch analytics counts
    const fetchAnalytics = async () => {
      try {
        const [uncRes, oosRes, lowRes] = await Promise.all([
          fetch('/api/products?noCategory=true'),
          fetch('/api/products?lowStock=0'),
          fetch('/api/products?lowStock=5&excludeOutOfStock=true')
        ])
        const unc = await uncRes.json()
        const oos = await oosRes.json()
        const low = await lowRes.json()
        setNoCategoryCount(Array.isArray(unc.data) ? unc.data.length : (unc.total || 0))
        setOutOfStockCount(Array.isArray(oos.data) ? oos.data.length : (oos.total || 0))
        setLowStockCount(Array.isArray(low.data) ? low.data.length : (low.total || 0))
      } catch (e) {
        console.error('Error fetching analytics:', e)
      }
    }
    fetchAnalytics()
  }, [])

  useEffect(() => {
    // Apply admin filter
    if (adminFilter === 'all') {
      fetchProducts()
    } else if (adminFilter === 'uncategorized') {
      fetchProducts({ noCategory: true })
    } else if (adminFilter === 'out_of_stock') {
      fetchProducts({ lowStock: 0 })
    } else if (adminFilter === 'low_stock') {
      fetchProducts({ lowStock: 5, excludeOutOfStock: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminFilter])

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setSelectedImage(product.image)
    setIsEditModalOpen(true)
  }

  const handleSaveChanges = () => {
    // Here you would typically save to database
    console.log("[v0] Saving product changes:", editingProduct)
    setIsEditModalOpen(false)
    setEditingProduct(null)
    setSelectedImage(null)
  }

  const handleToggleFeatured = async (product: any) => {
    setUpdateError(null)
    setTogglingId(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.featured }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al actualizar destacado')
      await fetchProducts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setUpdateError(msg)
      console.error('Error toggling featured:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setSelectedImage(imageUrl)
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, image: imageUrl })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: "" })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-streetwear-lg">PRODUCT MANAGEMENT</h1>
            <p className="text-muted-foreground">Manage your streetwear inventory</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              ADD NEW PRODUCT
            </Link>
          </Button>
        </div>

        {/* Analytics & Filters */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>OVERVIEW</CardTitle>
            <div className="flex gap-2">
              <Button variant={adminFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setAdminFilter('all')}>
                <Filter className="h-4 w-4 mr-2" /> Todos
              </Button>
              <Button variant={adminFilter === 'uncategorized' ? 'default' : 'outline'} size="sm" onClick={() => setAdminFilter('uncategorized')}>
                Sin categoría
              </Button>
              <Button variant={adminFilter === 'out_of_stock' ? 'default' : 'outline'} size="sm" onClick={() => setAdminFilter('out_of_stock')}>
                Sin stock
              </Button>
              <Button variant={adminFilter === 'low_stock' ? 'default' : 'outline'} size="sm" onClick={() => setAdminFilter('low_stock')}>
                Stock bajo (≤5)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Productos sin categoría</p>
                  <p className="text-xl font-semibold">{noCategoryCount}</p>
                </div>
                <Badge variant="secondary">Revisar</Badge>
              </div>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Productos sin stock</p>
                  <p className="text-xl font-semibold">{outOfStockCount}</p>
                </div>
                <Badge variant="destructive">Atención</Badge>
              </div>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock bajo (≤5)</p>
                  <p className="text-xl font-semibold">{lowStockCount}</p>
                </div>
                <Badge>Monitorear</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading / Error states */}
        {loading && (
          <div className="mb-4 text-sm text-muted-foreground">Loading products...</div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-500">Error: {error}</div>
        )}
        {updateError && (
          <div className="mb-4 text-sm text-red-500">Error: {updateError}</div>
        )}

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>ALL PRODUCTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsList.map((product) => {
                const stockVal = typeof product.stock === 'number' ? product.stock : undefined
                const status = (() => {
                  if (stockVal === 0) return "out_of_stock"
                  if (typeof stockVal === 'number' && stockVal <= 5) return "low_stock"
                  return product.inStock ? "active" : "inactive"
                })()

                const badgeVariant =
                  status === "active"
                    ? "default"
                    : status === "low_stock"
                      ? "secondary"
                      : "destructive"

                const badgeText =
                  status === "active"
                    ? "Active"
                    : status === "low_stock"
                      ? "Low Stock"
                      : status === "out_of_stock"
                        ? "Out of Stock"
                        : "Inactive"

                return (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm font-medium">{product.price ?? `$${product.priceNumeric}`}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Stock: {stockVal ?? "-"}</p>
                        <Badge variant={badgeVariant as any}>{badgeText}</Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={product.featured ? "default" : "outline"}
                          onClick={() => handleToggleFeatured(product)}
                          disabled={togglingId === product.id}
                          title={product.featured ? "Quitar destacado" : "Marcar como destacado"}
                          aria-pressed={product.featured}
                        >
                          <Star className={`h-4 w-4 ${product.featured ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-streetwear-base">EDIT PRODUCT</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right font-medium pt-2">Image</Label>
                  <div className="col-span-3 space-y-3">
                    {/* Dropzone and preview retained */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                        isDragOver
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-muted-foreground/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {selectedImage ? (
                        <div className="relative">
                          <Image
                            src={selectedImage || "/placeholder.svg"}
                            alt="Product preview"
                            width={120}
                            height={120}
                            className="rounded object-cover mx-auto"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-1">Drag and drop an image here, or</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right font-medium">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingProduct.priceNumeric ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceNumeric: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right font-medium">
                    Category
                  </Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoodies & Sweatshirts">Hoodies & Sweatshirts</SelectItem>
                      <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                      <SelectItem value="Pants">Pants</SelectItem>
                      <SelectItem value="Jackets">Jackets</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right font-medium">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editingProduct.stock ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
