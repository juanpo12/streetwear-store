"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

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

  // Estados para los datos dinámicos
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [sizes, setSizes] = useState<{ id: string; name: string; displayOrder: number }[]>([])
  const [colors, setColors] = useState<{ id: string; name: string; hexCode: string | null; displayOrder: number }[]>([])
  const [loading, setLoading] = useState(true)

  // Funciones para cargar datos desde los endpoints
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSizes = async () => {
    try {
      const response = await fetch('/api/sizes')
      if (response.ok) {
        const data = await response.json()
        setSizes(data)
      }
    } catch (error) {
      console.error('Error fetching sizes:', error)
    }
  }

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors')
      if (response.ok) {
        const data = await response.json()
        setColors(data)
      }
    } catch (error) {
      console.error('Error fetching colors:', error)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCategories(), fetchSizes(), fetchColors()])
      setLoading(false)
    }
    loadData()
  }, [])

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
                    <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      {loading ? (
                        <p className="text-sm text-muted-foreground">Loading sizes...</p>
                      ) : sizes.length > 0 ? (
                        sizes.map((size) => (
                          <Button
                            key={size.id}
                            type="button"
                            variant={formData.sizes.includes(size.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newSizes = formData.sizes.includes(size.name)
                                ? formData.sizes.filter((s) => s !== size.name)
                                : [...formData.sizes, size.name]
                              setFormData({ ...formData, sizes: newSizes })
                            }}
                          >
                            {size.name}
                          </Button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No sizes available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Available Colors</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {loading ? (
                        <p className="text-sm text-muted-foreground">Loading colors...</p>
                      ) : colors.length > 0 ? (
                        colors.map((color) => (
                          <Button
                            key={color.id}
                            type="button"
                            variant={formData.colors.includes(color.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newColors = formData.colors.includes(color.name)
                                ? formData.colors.filter((c) => c !== color.name)
                                : [...formData.colors, color.name]
                              setFormData({ ...formData, colors: newColors })
                            }}
                          >
                            {color.name}
                          </Button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No colors available</p>
                      )}
                    </div>
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
