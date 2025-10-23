import { Category, Size, Color } from "@/lib/db"
import { useEffect, useState } from "react"

interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
}

interface UpdateCategoryInput {
  id: string
  name: string
  slug?: string
  description?: string
}

interface CreateSizeInput {
  name: string
  displayOrder?: number
}

interface CreateColorInput {
  name: string
  hexCode?: string
  displayOrder?: number
}

interface CreateProductInput {
  name: string
  description?: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  categoryId?: string
  stock?: number
  weight?: number
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  isFeatured?: boolean
  isActive?: boolean
  images?: string[]
  sizes?: string[]
  colors?: string[]
}

type CategoryWithCount = Category & { productCount?: number }

interface UseCategoriesReturn {
  categories: CategoryWithCount[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  createCategory: (data: CreateCategoryInput) => Promise<CategoryWithCount | null>
  updateCategory: (data: UpdateCategoryInput) => Promise<CategoryWithCount | null>
  deleteCategory: (id: string) => Promise<boolean>
}

interface UseSizesReturn {
  sizes: Size[]
  loading: boolean
  error: string | null
  fetchSizes: () => Promise<void>
  createSize: (data: CreateSizeInput) => Promise<Size | null>
}

interface UseColorsReturn {
  colors: Color[]
  loading: boolean
  error: string | null
  fetchColors: () => Promise<void>
  createColor: (data: CreateColorInput) => Promise<Color | null>
}

interface UseCreateProductReturn {
  loading: boolean
  error: string | null
  success: boolean
  createProduct: (data: CreateProductInput) => Promise<any | null>
  reset: () => void
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching categories'
      setError(message)
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (data: CreateCategoryInput): Promise<CategoryWithCount | null> => {
    setError(null)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      const newCategory = await response.json()
      setCategories((prev) => [...prev, newCategory])
      return newCategory
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating category'
      setError(message)
      console.error('Error creating category:', err)
      return null
    }
  }

  const updateCategory = async (data: UpdateCategoryInput): Promise<CategoryWithCount | null> => {
    setError(null)
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Failed to update category')
      }

      setCategories((prev) => prev.map((c) => c.id === data.id ? { ...c, ...json } : c))
      return json
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating category'
      setError(message)
      console.error('Error updating category:', err)
      return null
    }
  }

  // deleteCategory
  const deleteCategory = async (id: string): Promise<boolean> => {
    setError(null)
    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Failed to delete category')
      }
      setCategories((prev) => prev.filter((c) => c.id !== id))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting category'
      setError(message)
      console.error('Error deleting category:', err)
      return false
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

export const useSizes = (): UseSizesReturn => {
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSizes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/sizes')
      if (!response.ok) {
        throw new Error('Failed to fetch sizes')
      }
      const data = await response.json()
      setSizes(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching sizes'
      setError(message)
      console.error('Error fetching sizes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSize = async (data: CreateSizeInput): Promise<Size | null> => {
    setError(null)
    try {
      const response = await fetch('/api/sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create size')
      }

      const newSize = await response.json()
      setSizes((prev) => [...prev, newSize])
      return newSize
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating size'
      setError(message)
      console.error('Error creating size:', err)
      return null
    }
  }

  useEffect(() => {
    fetchSizes()
  }, [])

  return {
    sizes,
    loading,
    error,
    fetchSizes,
    createSize,
  }
}

export const useColors = (): UseColorsReturn => {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchColors = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/colors')
      if (!response.ok) {
        throw new Error('Failed to fetch colors')
      }
      const data = await response.json()
      setColors(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching colors'
      setError(message)
      console.error('Error fetching colors:', err)
    } finally {
      setLoading(false)
    }
  }

  const createColor = async (data: CreateColorInput): Promise<Color | null> => {
    setError(null)
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create color')
      }

      const newColor = await response.json()
      setColors((prev) => [...prev, newColor])
      return newColor
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating color'
      setError(message)
      console.error('Error creating color:', err)
      return null
    }
  }

  useEffect(() => {
    fetchColors()
  }, [])

  return {
    colors,
    loading,
    error,
    fetchColors,
    createColor,
  }
}

export const useCreateProduct = (): UseCreateProductReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createProduct = async (data: CreateProductInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // credentials: 'include' // Include cookies for authentication - Commented out as requested
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el producto')
      }

      setSuccess(true)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error creating product:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return {
    loading,
    error,
    success,
    createProduct,
    reset,
  }
}

// Productos: listado
export interface UseProductsOptions {
  category?: string
  featured?: boolean
  limit?: number
  query?: string
  excludeUncategorized?: boolean
  noCategory?: boolean
  lowStock?: number
  excludeOutOfStock?: boolean
}

export interface UseProductsReturn {
  products: any[]
  loading: boolean
  error: string | null
  fetchProducts: (options?: UseProductsOptions) => Promise<void>
}

export const useProducts = (opts?: UseProductsOptions): UseProductsReturn => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const buildUrl = (options?: UseProductsOptions) => {
    const params = new URLSearchParams()
    if (options?.category) params.set('category', options.category)
    if (options?.featured) params.set('featured', 'true')
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.query) params.set('q', options.query)
    if (options?.excludeUncategorized) params.set('excludeUncategorized', 'true')
    if (options?.noCategory) params.set('noCategory', 'true')
    if (typeof options?.lowStock === 'number') params.set('lowStock', String(options.lowStock))
    if (options?.excludeOutOfStock) params.set('excludeOutOfStock', 'true')
    const qs = params.toString()
    return `/api/products${qs ? `?${qs}` : ''}`
  }

  const fetchProducts = async (options?: UseProductsOptions) => {
    setLoading(true)
    setError(null)
    try {
      const url = buildUrl(options ?? opts)
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch products')
      const items = Array.isArray(json.data) ? json.data : []
      setProducts(items)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching products'
      setError(message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts?.category, opts?.featured, opts?.limit, opts?.query, opts?.excludeUncategorized, opts?.noCategory, opts?.lowStock, opts?.excludeOutOfStock])

  return { products, loading, error, fetchProducts }
}