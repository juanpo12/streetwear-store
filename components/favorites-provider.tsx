"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description?: string
}

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: number) => void
  isFavorite: (productId: number) => boolean
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  // Load favorites from localStorage for non-authenticated users
  // or from per-user localStorage for authenticated users
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated && user) {
        const stored = localStorage.getItem(`favorites_${user.id}`)
        if (stored) {
          setFavorites(JSON.parse(stored))
        }
      } else {
        const stored = localStorage.getItem('favorites_guest')
        if (stored) {
          setFavorites(JSON.parse(stored))
        }
      }
      setLoading(false)
    }

    loadFavorites()
  }, [isAuthenticated, user])

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Product[]) => {
    const key = isAuthenticated && user ? `favorites_${user.id}` : 'favorites_guest'
    localStorage.setItem(key, JSON.stringify(newFavorites))
  }

  const addToFavorites = (product: Product) => {
    const newFavorites = [...favorites, product]
    setFavorites(newFavorites)
    saveFavorites(newFavorites)
  }

  const removeFromFavorites = (productId: number) => {
    const newFavorites = favorites.filter(item => item.id !== productId)
    setFavorites(newFavorites)
    saveFavorites(newFavorites)
  }

  const isFavorite = (productId: number) => {
    return favorites.some(item => item.id === productId)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}