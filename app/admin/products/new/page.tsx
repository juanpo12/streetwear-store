"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useCategories, useSizes, useColors } from "@/hooks/use-products"

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    sizes: [] as string[],
    colors: [] as string[],
  })

  // Usar los hooks personalizados
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory } = useCategories()
  const { sizes, loading: sizesLoading, error: sizesError, createSize } = useSizes()
  const { colors, loading: colorsLoading, error: colorsError, createColor } = useColors()

  // Loading general
  const loading = categoriesLoading || sizesLoading || colorsLoading

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Product data:", formData)
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
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="15"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <CreatableSelect
                      options={categories.map(cat => ({ id: cat.id, name: cat.name }))}
                      value={formData.category ? [categories.find(cat => cat.id === formData.category)?.name || formData.category] : []}
                      onChange={(value) => {
                        const selectedCategory = categories.find(cat => cat.name === value[0])
                        setFormData({ ...formData, category: selectedCategory?.id || value[0] || "" })
                      }}
                      onCreateOption={async (name) => {
                        const newCategory = await createCategory({ name })
                        if (newCategory) {
                          setFormData({ ...formData, category: newCategory.id })
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
                  <div>
                    <Label>Available Sizes</Label>
                    <CreatableSelect
                      options={sizes.map(size => ({ id: size.id, name: size.name }))}
                      value={formData.sizes}
                      onChange={(value) => setFormData({ ...formData, sizes: value })}
                      onCreateOption={async (name) => {
                        await createSize({ name })
                      }}
                      placeholder={loading ? "Loading sizes..." : "Select or create sizes"}
                      loading={sizesLoading}
                      multiple={true}
                    />
                  </div>

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
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop images here, or click to select</p>
                    <Button variant="outline" size="sm">
                      SELECT FILES
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ACTIONS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full">
                    CREATE PRODUCT
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    SAVE AS DRAFT
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
