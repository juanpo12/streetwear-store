"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description?: string
  sizes?: string[]
  colors?: string[]
  inStock?: boolean
  featured?: boolean
}

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (isAuthenticated && user) {
          try {
            const response = await fetch("/api/wishlist", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              cache: "no-store",
            })

            if (response.ok) {
              const json = await response.json()
              const data = Array.isArray(json.data) ? json.data : []
              setFavorites(data)
              localStorage.setItem(`favorites_${user.id}`, JSON.stringify(data))
              setLoading(false)
              return
            }
          } catch (error) {
            console.error("Error fetching wishlist from API:", error)
          }

          const storedUser = localStorage.getItem(`favorites_${user.id}`)
          if (storedUser) {
            setFavorites(JSON.parse(storedUser))
          }
        } else {
          const storedGuest = localStorage.getItem("favorites_guest")
          if (storedGuest) {
            setFavorites(JSON.parse(storedGuest))
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [isAuthenticated, user])

  const saveFavorites = (newFavorites: Product[]) => {
    const key = isAuthenticated && user ? `favorites_${user.id}` : "favorites_guest"
    localStorage.setItem(key, JSON.stringify(newFavorites))
  }

  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev
      }
      const updated = [...prev, product]
      saveFavorites(updated)
      return updated
    })

    if (isAuthenticated && user) {
      ;(async () => {
        try {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId: product.id }),
          })
        } catch (error) {
          console.error("Error adding to wishlist:", error)
        }
      })()
    }
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item.id !== productId)
      saveFavorites(updated)
      return updated
    })

    if (isAuthenticated && user) {
      ;(async () => {
        try {
          await fetch(`/api/wishlist/${productId}`, {
            method: "DELETE",
          })
        } catch (error) {
          console.error("Error removing from wishlist:", error)
        }
      })()
    }
  }

  const isFavorite = (productId: string) => {
    return favorites.some((item) => item.id === productId)
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
