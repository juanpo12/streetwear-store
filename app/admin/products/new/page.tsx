"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { ImageUpload } from "@/components/ui/image-upload"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCategories, useSizes, useColors, useCreateProduct } from "@/hooks/use-products"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewProductPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    stock: "",
    weight: "",
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    // Siempre usamos el set de talles por defecto
    sizes: ["S","M","L","XL","XXL"] as string[],
    // Toggle para definir si el producto es de "único modelo" (sin colores)
    isSingleModel: false,
    colors: [] as string[],
    // Stock común por talle (se usa cuando es "único modelo")
    sizeStocks: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as Record<string, number>,
    // Stock por color+talle (se usa cuando NO es "único modelo")
    sizeColorStocks: {} as Record<string, Record<string, number>>,
  })

  const [productImages, setProductImages] = useState<{url: string, originalName: string, fileName: string, filePath: string, size: number, type: string}[]>([])

  // Usar los hooks personalizados
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory } = useCategories()
  const { sizes, loading: sizesLoading, error: sizesError, createSize } = useSizes()
  const { colors, loading: colorsLoading, error: colorsError, createColor } = useColors()
  const { loading: createLoading, error: createError, success, createProduct, reset } = useCreateProduct()

  // Loading general
  const loading = categoriesLoading || sizesLoading || colorsLoading || createLoading

  // Efecto para redirigir después de crear el producto exitosamente
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        router.push('/admin/products')
      }, 2000) // Esperar 2 segundos para mostrar el mensaje de éxito
    }
  }, [success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert("Por favor completa los campos obligatorios: nombre, precio y categoría")
      return
    }

    const isSingleModel = !!formData.isSingleModel
    const totalStock = isSingleModel
      ? Object.values(formData.sizeStocks || {}).reduce((sum, v) => sum + (Number(v) || 0), 0)
      : Object.values(formData.sizeColorStocks || {}).reduce((sum, perColor) => sum + Object.values(perColor || {}).reduce((s, v) => s + (Number(v) || 0), 0), 0)

    await createProduct({
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      categoryId: formData.categoryId,
      stock: totalStock,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      isFeatured: formData.isFeatured,
      images: productImages.map(img => img.url),
      // Talles siempre por defecto
      sizes: ["S","M","L","XL","XXL"],
      // Si es único modelo, no enviamos colores; el backend usará "Color Único" por defecto
      colors: isSingleModel ? [] : formData.colors,
      // Enviar stock según corresponda
      sizeStocks: isSingleModel ? formData.sizeStocks : undefined,
      sizeColorStocks: isSingleModel ? undefined : formData.sizeColorStocks,
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO PRODUCTS
            </Link>
          </Button>
          <div>
            <h1 className="text-streetwear-lg">ADD NEW PRODUCT</h1>
            <p className="text-muted-foreground">Create a new streetwear item</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PRODUCT DETAILS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., OVERSIZED HOODIE"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the product..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="89"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    {/* Removed single stock input in favor of per-size stocks */}
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <CreatableSelect
                      options={categories.map(cat => ({ id: cat.id, name: cat.name }))}
                      value={formData.categoryId ? [categories.find(cat => cat.id === formData.categoryId)?.name || formData.categoryId] : []}
                      onChange={(value) => {
                        const selectedCategory = categories.find(cat => cat.name === value[0])
                        setFormData({ ...formData, categoryId: selectedCategory?.id || value[0] || "" })
                      }}
                      onCreateOption={async (name) => {
                        const newCategory = await createCategory({ name })
                        if (newCategory) {
                          setFormData({ ...formData, categoryId: newCategory.id })
                        }
                      }}
                      placeholder={loading ? "Loading categories..." : "Select or create category"}
                      loading={categoriesLoading}
                      multiple={false}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>VARIANTS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Toggle Único modelo */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="single-model"
                      checked={formData.isSingleModel}
                      onCheckedChange={(checked) => {
                        const val = Boolean(checked)
                        setFormData(prev => ({
                          ...prev,
                          isSingleModel: val,
                          // Si se pasa a único modelo, limpiamos colores y stock por color
                          colors: val ? [] : prev.colors,
                          sizeColorStocks: val ? {} : prev.sizeColorStocks,
                        }))
                      }}
                    />
                    <Label htmlFor="single-model">Único modelo (sin colores)</Label>
                  </div>

                  {/* Si NO es único modelo, primero colores */}
                  {!formData.isSingleModel && (
                    <div>
                      <Label>Available Colors</Label>
                      <CreatableSelect
                        options={colors.map(color => ({ id: color.id, name: color.name }))}
                        value={formData.colors}
                        onChange={(value) => setFormData({ ...formData, colors: value })}
                        onCreateOption={async (name) => {
                          await createColor({ name })
                        }}
                        placeholder={loading ? "Loading colors..." : "Select or create colors"}
                        loading={colorsLoading}
                        multiple={true}
                      />
                    </div>
                  )}

                  {/* Si es único modelo: stock común por talle */}
                  {formData.isSingleModel && (
                    <div>
                      <Label>Stock por talle</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {["S","M","L","XL","XXL"].map((sz) => (
                          <div key={sz} className="space-y-1">
                            <Label htmlFor={`stock-${sz}`}>{sz}</Label>
                            <Input
                              id={`stock-${sz}`}
                              type="number"
                              value={String(formData.sizeStocks[sz] ?? 0)}
                              onChange={(e) => setFormData({ ...formData, sizeStocks: { ...formData.sizeStocks, [sz]: Number(e.target.value) } })}
                              min={0}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Si NO es único modelo: stock por color+talle */}
                  {!formData.isSingleModel && (
                    <div>
                      <Label>Stock por talle y color</Label>
                      {formData.colors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Seleccioná colores para cargar stock por color+talle.</p>
                      ) : (
                        <div className="space-y-6">
                          {formData.colors.map((colorName) => {
                            const sizesToUse = ["S","M","L","XL","XXL"]
                            const perColor = formData.sizeColorStocks[colorName] || {}
                            return (
                              <div key={colorName} className="space-y-2">
                                <Label>{colorName}</Label>
                                <div className="grid grid-cols-5 gap-3">
                                  {sizesToUse.map((sz) => (
                                    <div key={`${colorName}-${sz}`} className="space-y-1">
                                      <Label htmlFor={`stock-${colorName}-${sz}`}>{sz}</Label>
                                      <Input
                                        id={`stock-${colorName}-${sz}`}
                                        type="number"
                                        value={String(perColor[sz] ?? 0)}
                                        min={0}
                                        onChange={(e) => {
                                          const qty = Number(e.target.value)
                                          setFormData(prev => ({
                                            ...prev,
                                            sizeColorStocks: {
                                              ...prev.sizeColorStocks,
                                              [colorName]: {
                                                ...prev.sizeColorStocks[colorName],
                                                [sz]: qty,
                                              },
                                            },
                                          }))
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PRODUCT IMAGES</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImagesChange={setProductImages}
                    maxImages={10}
                    maxSizeInMB={5}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ACTIONS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {createError && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                      Error: {createError}
                    </div>
                  )}
                  {success && (
                    <div className="text-green-500 text-sm p-2 bg-green-50 rounded">
                      ¡Producto creado exitosamente!
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {createLoading ? "CREANDO..." : "CREATE PRODUCT"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" asChild>
                    <Link href="/admin/products">CANCEL</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
