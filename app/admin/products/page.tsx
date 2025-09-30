"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef } from "react"

// Mock data - replace with real data later
const products = [
  {
    id: "1",
    name: "OVERSIZED HOODIE",
    price: 89,
    image: "/oversized-black-hoodie.jpg",
    category: "HOODIES",
    stock: 15,
    status: "active",
  },
  {
    id: "2",
    name: "BOXY TEE",
    price: 45,
    image: "/boxy-white-t-shirt.jpg",
    category: "TEES",
    stock: 8,
    status: "active",
  },
  {
    id: "3",
    name: "CARGO PANTS",
    price: 120,
    image: "/cargo-pants.png",
    category: "BOTTOMS",
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: "4",
    name: "CROPPED JACKET",
    price: 150,
    image: "/cropped-jacket.jpg",
    category: "JACKETS",
    stock: 5,
    status: "low_stock",
  },
]

export default function AdminProductsPage() {
  const [editingProduct, setEditingProduct] = useState<(typeof products)[0] | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEditProduct = (product: (typeof products)[0]) => {
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

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>ALL PRODUCTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
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
                      <p className="text-sm font-medium">${product.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Stock: {product.stock}</p>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : product.status === "low_stock"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {product.status === "active"
                          ? "Active"
                          : product.status === "low_stock"
                            ? "Low Stock"
                            : "Out of Stock"}
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
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
                    value={editingProduct.stock}
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
