"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { ImageUpload } from "@/components/ui/image-upload"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useCategories, useSizes, useColors } from "@/hooks/use-products"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface UploadedImage {
  originalName: string
  fileName: string
  filePath: string
  url: string
  size: number
  type: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = params?.id as string

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
    sizes: [] as string[],
    colors: [] as string[],
    sizeMode: "letters" as "letters" | "numeric",
    numericSizes: [] as string[],
  })

  const defaultSizes = ['S','M','L','XL','XXL']
  const [isSingleModel, setIsSingleModel] = useState(false)
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({})
  const [sizeColorStocks, setSizeColorStocks] = useState<Record<string, Record<string, number>>>({})
  const [numericSizeStocks, setNumericSizeStocks] = useState<Record<string, number>>({})
  const [numericSizeColorStocks, setNumericSizeColorStocks] = useState<Record<string, Record<string, number>>>({})
  const [numericInput, setNumericInput] = useState<string>("")
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { categories, loading: categoriesLoading, error: categoriesError, createCategory } = useCategories()
  const { sizes, loading: sizesLoading, error: sizesError, createSize } = useSizes()
  const { colors, loading: colorsLoading, error: colorsError, createColor } = useColors()

  const loading = categoriesLoading || sizesLoading || colorsLoading || saving

  // Fetch producto existente
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error al cargar el producto')
        const p = json.data
        // Mapear categoría por nombre -> id si existe
        const catId = categories.find(c => c.name === p.category)?.id || ""
        const sizesArray = Array.isArray(p.sizes) ? p.sizes : []
        const isLettersMode = sizesArray.length === 0 || sizesArray.every((s: string) => defaultSizes.includes(s))
        setFormData({
          name: p.name || "",
          description: p.description || "",
          shortDescription: p.shortDescription || "",
          price: String(p.priceNumeric ?? ""),
          compareAtPrice: String(p.compareAtPriceNumeric ?? ""),
          categoryId: catId,
          stock: typeof p.inStock === 'boolean' ? (p.inStock ? "1" : "0") : "",
          weight: "",
          metaTitle: "",
          metaDescription: "",
          isFeatured: !!p.featured,
          sizes: sizesArray,
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizeMode: isLettersMode ? "letters" : "numeric",
          numericSizes: isLettersMode ? [] : sizesArray,
        })
        const imgs = Array.isArray(p.images) ? p.images.map((i: any) => i.url || i) : []
        setExistingImages(imgs)

        const variants = Array.isArray(p.variants) ? p.variants : []
        const initialColorStocks: Record<string, Record<string, number>> = {}
        variants.forEach((v: any) => {
          const parts = (v.title || '').includes(' / ') ? (v.title || '').split(' / ') : [(v.title || '').trim(), 'Color Único']
          const size = (parts[0] || '').trim()
          const color = (parts[1] || 'Color Único').trim()
          if (!initialColorStocks[color]) initialColorStocks[color] = {}
          initialColorStocks[color][size] = v.inventoryQuantity || 0
        })
        setSizeColorStocks(initialColorStocks)
        setNumericSizeColorStocks(initialColorStocks)

        const single = ((p.colors || []).length <= 1)
        setIsSingleModel(single)
        if (single) {
          const uniqueColor = Object.keys(initialColorStocks)[0] || 'Color Único'
          if (isLettersMode) {
            const stocks: Record<string, number> = {}
            defaultSizes.forEach(s => {
              const v = initialColorStocks[uniqueColor]?.[s]
              if (typeof v === 'number') stocks[s] = v
            })
            setSizeStocks(stocks)
          } else {
            const stocksNum: Record<string, number> = {}
            sizesArray.forEach(s => {
              const v = initialColorStocks[uniqueColor]?.[s]
              if (typeof v === 'number') stocksNum[s] = v
            })
            setNumericSizeStocks(stocksNum)
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setError(msg)
        console.error('Error fetching product for edit:', err)
      }
    }
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, categories])

  const finalImages = useMemo(() => {
    return [
      ...existingImages,
      ...uploadedImages.map(img => img.url)
    ]
  }, [existingImages, uploadedImages])

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const activeSizes = formData.sizeMode === "letters" ? defaultSizes : formData.numericSizes
      if (formData.sizeMode === "numeric") {
        const invalid = activeSizes.some(s => !/^\d+$/.test(String(s)) || parseInt(String(s)) <= 0)
        if (invalid) {
          setError("Las tallas numéricas deben ser números positivos")
          setSaving(false)
          return
        }
      }
      const payload = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: formData.price ? parseFloat(formData.price) : undefined,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        categoryId: formData.categoryId || undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        isFeatured: formData.isFeatured,
        images: finalImages,
        sizes: activeSizes,
        colors: isSingleModel ? [] : formData.colors,
        sizeStocks: isSingleModel ? (formData.sizeMode === "letters" ? sizeStocks : numericSizeStocks) : undefined,
        sizeColorStocks: !isSingleModel ? (formData.sizeMode === "letters" ? sizeColorStocks : numericSizeColorStocks) : undefined,
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al actualizar el producto')

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/products')
      }, 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      console.error('Error updating product:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                BACK TO PRODUCTS
              </Link>
            </Button>
            <div>
              <h1 className="text-streetwear-lg">EDIT PRODUCT</h1>
              <p className="text-muted-foreground">Update an existing streetwear item</p>
            </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="100"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
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
                      placeholder={categoriesLoading ? "Loading categories..." : "Select or create category"}
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
                <div className="flex items-center gap-2">
                  <Checkbox id="single-model" checked={isSingleModel} onCheckedChange={(v) => {
                    const val = !!v
                    if (val) {
                      setFormData(prev => ({ ...prev, colors: [] }))
                      setSizeColorStocks({})
                      setNumericSizeColorStocks({})
                    }
                    setIsSingleModel(val)
                  }} />
                  <Label htmlFor="single-model">Único modelo (sin colores)</Label>
                </div>

                {!isSingleModel && (
                  <div>
                    <Label>Available Colors</Label>
                    <CreatableSelect
                      options={colors.map(color => ({ id: color.id, name: color.name }))}
                      value={formData.colors}
                      onChange={(value) => {
                        setFormData({ ...formData, colors: value })
                        setSizeColorStocks(prev => {
                          const copy = { ...prev }
                          value.forEach((c: string) => { if (!copy[c]) copy[c] = {} })
                          return copy
                        })
                        setNumericSizeColorStocks(prev => {
                          const copy = { ...prev }
                          value.forEach((c: string) => { if (!copy[c]) copy[c] = {} })
                          return copy
                        })
                      }}
                      onCreateOption={async (name) => {
                        await createColor({ name })
                      }}
                      placeholder={colorsLoading ? "Loading colors..." : "Select or create colors"}
                      loading={colorsLoading}
                      multiple={true}
                    />
                  </div>
                )}

                {isSingleModel && formData.sizeMode === "letters" ? (
                  <div className="mt-4">
                    <Label>Stock por talle</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {defaultSizes.map(size => (
                        <div key={size} className="flex items-center gap-2">
                          <span className="w-10">{size}</span>
                          <Input type="number" min={0} value={sizeStocks[size] ?? 0} onChange={(e) => setSizeStocks({ ...sizeStocks, [size]: parseInt(e.target.value) || 0 })} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {isSingleModel && formData.sizeMode === "numeric" ? (
                  <div className="mt-4">
                    <Label>Stock por talle numérico</Label>
                    {formData.numericSizes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Agregá talles numéricos para cargar stock.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.numericSizes.map(size => (
                          <div key={`num-${size}`} className="flex items-center gap-2">
                            <span className="w-10">{size}</span>
                            <Input type="number" min={0} value={numericSizeStocks[size] ?? 0} onChange={(e) => setNumericSizeStocks({ ...numericSizeStocks, [size]: parseInt(e.target.value) || 0 })} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
                {!isSingleModel && formData.sizeMode === "letters" ? (
                  <div className="mt-4">
                    <Label>Stock por talle y color</Label>
                    {formData.colors.map(color => (
                      <div key={color} className="mb-3">
                        <div className="font-medium mb-1">{color}</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {defaultSizes.map(size => (
                            <div key={size} className="flex items-center gap-2">
                              <span className="w-10">{size}</span>
                              <Input type="number" min={0} value={sizeColorStocks[color]?.[size] ?? 0} onChange={(e) => setSizeColorStocks(prev => ({ ...prev, [color]: { ...(prev[color] || {}), [size]: parseInt(e.target.value) || 0 } }))} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {!isSingleModel && formData.sizeMode === "numeric" ? (
                      <div className="mt-4">
                        <Label>Stock por talle numérico y color</Label>
                        {formData.colors.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Seleccioná colores para cargar stock por color+talle.</p>
                        ) : formData.numericSizes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Agregá talles numéricos para cargar stock.</p>
                        ) : (
                          formData.colors.map(color => (
                            <div key={`num-${color}`} className="mb-3">
                              <div className="font-medium mb-1">{color}</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {formData.numericSizes.map(size => (
                              <div key={`num-${color}-${size}`} className="flex items-center gap-2">
                                <span className="w-10">{size}</span>
                                <Input type="number" min={0} value={numericSizeColorStocks[color]?.[size] ?? 0} onChange={(e) => setNumericSizeColorStocks(prev => ({ ...prev, [color]: { ...(prev[color] || {}), [size]: parseInt(e.target.value) || 0 } }))} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
              <Card>
                <CardHeader>
                  <CardTitle>VARIANTS</CardTitle>
                </CardHeader>
                {/* Removed legacy variants card */}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PRODUCT IMAGES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Existing images list with remove */}
                  {existingImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {existingImages.map((url) => (
                          <div key={url} className="relative group">
                            <img src={url} alt="Product image" className="w-full h-full object-cover rounded-md" />
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded p-1 opacity-0 group-hover:opacity-100"
                              onClick={() => removeExistingImage(url)}
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <ImageUpload
                    onImagesChange={setUploadedImages}
                    maxImages={10}
                    maxSize={5 * 1024 * 1024}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ACTIONS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                      Error: {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-green-500 text-sm p-2 bg-green-50 rounded">
                      ¡Producto actualizado exitosamente!
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {saving ? "GUARDANDO..." : "SAVE CHANGES"}
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
