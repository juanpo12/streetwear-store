"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  productId?: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  variantId?: string
  stock?: number
  allowOutOfStock?: boolean
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: number
  totalPrice: number
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      const requestedQuantity = action.payload.quantity || 1
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + requestedQuantity
        // Check stock if available
        if (action.payload.stock !== undefined && !action.payload.allowOutOfStock && newQuantity > action.payload.stock) {
          // Don't add more than available stock
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${action.payload.stock} unidades disponibles de este producto.`,
            variant: "destructive",
          })
          return state
        }
        
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        }
      }
      
      // Check stock for new item
      if (action.payload.stock !== undefined && !action.payload.allowOutOfStock && requestedQuantity > action.payload.stock) {
        // Don't add if exceeds stock
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${action.payload.stock} unidades disponibles de este producto.`,
          variant: "destructive",
        })
        return state
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: requestedQuantity }],
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) => {
            if (item.id === action.payload.id) {
              // Check stock if available
              if (item.stock !== undefined && !item.allowOutOfStock && action.payload.quantity > item.stock) {
                // Don't update if exceeds stock
                toast({
                  title: "Stock insuficiente",
                  description: `Solo hay ${item.stock} unidades disponibles de este producto.`,
                  variant: "destructive",
                })
                return item
              }
              return { ...item, quantity: action.payload.quantity }
            }
            return item
          })
          .filter((item) => item.quantity > 0),
      }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }
    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      }
    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  })

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  const openCart = () => {
    dispatch({ type: "OPEN_CART" })
  }

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" })
  }

  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
