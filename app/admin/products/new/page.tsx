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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
    sizes: ["S","M","L","XL","XXL"] as string[],
    isSingleModel: false,
    colors: [] as string[],
    sizeStocks: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as Record<string, number>,
    sizeColorStocks: {} as Record<string, Record<string, number>>,
    sizeMode: "letters" as "letters" | "numeric",
    numericSizes: [] as string[],
    numericSizeStocks: {} as Record<string, number>,
    numericSizeColorStocks: {} as Record<string, Record<string, number>>,
  })

  const [productImages, setProductImages] = useState<{url: string, originalName: string, fileName: string, filePath: string, size: number, type: string}[]>([])
  const [numericInput, setNumericInput] = useState<string>("")

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
    const activeSizes = formData.sizeMode === "letters" ? ["S","M","L","XL","XXL"] : formData.numericSizes
    if (formData.sizeMode === "numeric") {
      const invalid = activeSizes.some(s => !/^\d+$/.test(String(s)) || parseInt(String(s)) <= 0)
      if (invalid) {
        alert("Las tallas numéricas deben ser números positivos")
        return
      }
    }
    const totalStock = isSingleModel
      ? Object.values(formData.sizeMode === "letters" ? formData.sizeStocks || {} : formData.numericSizeStocks || {}).reduce((sum, v) => sum + (Number(v) || 0), 0)
      : Object.values(formData.sizeMode === "letters" ? formData.sizeColorStocks || {} : formData.numericSizeColorStocks || {}).reduce((sum, perColor) => sum + Object.values(perColor || {}).reduce((s, v) => s + (Number(v) || 0), 0), 0)

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
      sizes: activeSizes,
      colors: isSingleModel ? [] : formData.colors,
      sizeStocks: isSingleModel ? (formData.sizeMode === "letters" ? formData.sizeStocks : formData.numericSizeStocks) : undefined,
      sizeColorStocks: isSingleModel ? undefined : (formData.sizeMode === "letters" ? formData.sizeColorStocks : formData.numericSizeColorStocks),
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="compareAtPrice">Precio anterior ($)</Label>
                      <Input
                        id="compareAtPrice"
                        type="number"
                        placeholder="Ej.: 99 (opcional)"
                        value={formData.compareAtPrice}
                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Si el producto tiene rebaja, el precio anterior debe ser mayor que el precio actual.</p>
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
                        // Solo guardar IDs válidos; si no existe, requerir crear la categoría
                        setFormData({ ...formData, categoryId: selectedCategory?.id || "" })
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
                  <div className="space-y-2">
                    <Label>Modo de talles</Label>
                    <ToggleGroup
                      type="single"
                      value={formData.sizeMode}
                      onValueChange={(val) => {
                        if (!val) return
                        setFormData(prev => ({ ...prev, sizeMode: val as "letters" | "numeric" }))
                      }}
                      className="w-full"
                    >
                      <ToggleGroupItem value="letters">Letras (S, M, L, XL, XXL)</ToggleGroupItem>
                      <ToggleGroupItem value="numeric">Números (46, 48, 50)</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  {formData.sizeMode === "numeric" && (
                    <div className="space-y-3">
                      <Label>Talles numéricos</Label>
                      <div className="flex gap-2">
                        <Input
                          id="numeric-size-input"
                          type="number"
                          placeholder="Ej.: 46"
                          value={numericInput}
                          min={1}
                          onChange={(e) => setNumericInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = numericInput.trim()
                              if (!/^\d+$/.test(val) || parseInt(val) <= 0) return
                              setFormData(prev => {
                                const exists = prev.numericSizes.includes(val)
                                const newSizes = exists ? prev.numericSizes : [...prev.numericSizes, val]
                                return { ...prev, numericSizes: newSizes }
                              })
                              setNumericInput("")
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const val = numericInput.trim()
                            if (!/^\d+$/.test(val) || parseInt(val) <= 0) return
                            setFormData(prev => {
                              const exists = prev.numericSizes.includes(val)
                              const newSizes = exists ? prev.numericSizes : [...prev.numericSizes, val]
                              return { ...prev, numericSizes: newSizes }
                            })
                            setNumericInput("")
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                      {formData.numericSizes.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {formData.numericSizes.map((sz) => (
                            <span key={`chip-${sz}`} className="px-2 py-1 text-xs rounded border">{sz}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Agregá talles numéricos y luego completá el stock.</p>
                      )}
                    </div>
                  )}
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

                  {formData.sizeMode === "letters" && formData.isSingleModel && (
                    <div>
                      <Label>Stock por talle</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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

                  {formData.sizeMode === "numeric" && formData.isSingleModel && (
                    <div className="space-y-3">
                      <Label>Stock por talle numérico</Label>
                      {formData.numericSizes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {formData.numericSizes.map((sz) => (
                            <div key={sz} className="space-y-1">
                              <Label htmlFor={`stock-num-${sz}`}>{sz}</Label>
                              <Input
                                id={`stock-num-${sz}`}
                                type="number"
                                value={String(formData.numericSizeStocks[sz] ?? 0)}
                                onChange={(e) => setFormData({ ...formData, numericSizeStocks: { ...formData.numericSizeStocks, [sz]: Number(e.target.value) } })}
                                min={0}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Agregá talles numéricos para cargar stock.</p>
                      )}
                    </div>
                  )}

                  {!formData.isSingleModel && formData.sizeMode === "letters" && (
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
                  {!formData.isSingleModel && formData.sizeMode === "numeric" && (
                    <div className="space-y-3">
                      <Label>Stock por talle numérico y color</Label>
                      {formData.colors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Seleccioná colores para cargar stock por color+talle.</p>
                      ) : formData.numericSizes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Agregá talles numéricos para cargar stock.</p>
                      ) : (
                        <div className="space-y-6">
                          {formData.colors.map((colorName) => {
                            const sizesToUse = formData.numericSizes
                            const perColor = formData.numericSizeColorStocks[colorName] || {}
                            return (
                              <div key={`num-${colorName}`} className="space-y-2">
                                <Label>{colorName}</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                  {sizesToUse.map((sz) => (
                                    <div key={`num-${colorName}-${sz}`} className="space-y-1">
                                      <Label htmlFor={`stock-num-${colorName}-${sz}`}>{sz}</Label>
                                      <Input
                                        id={`stock-num-${colorName}-${sz}`}
                                        type="number"
                                        value={String(perColor[sz] ?? 0)}
                                        min={0}
                                        onChange={(e) => {
                                          const qty = Number(e.target.value)
                                          setFormData(prev => ({
                                            ...prev,
                                            numericSizeColorStocks: {
                                              ...prev.numericSizeColorStocks,
                                              [colorName]: {
                                                ...prev.numericSizeColorStocks[colorName],
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
