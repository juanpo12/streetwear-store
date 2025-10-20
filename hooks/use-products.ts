import { Category } from "@/lib/db"
import { useEffect, useState } from "react"

interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  createCategory: (data: CreateCategoryInput) => Promise<Category | null>
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