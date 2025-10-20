import { Category, Size, Color } from "@/lib/db"
import { useEffect, useState } from "react"

interface CreateCategoryInput {
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

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  createCategory: (data: CreateCategoryInput) => Promise<Category | null>
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

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([])
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

  const createCategory = async (data: CreateCategoryInput): Promise<Category | null> => {
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

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
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