"use client"

import { useState } from "react"
import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Tag, Package, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CheckoutForm } from "./checkout/checkout-form"

export function CartSidebar() {
  const { state, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const handleBackToCart = () => {
    setShowCheckout(false)
  }

  if (!state.isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
        onClick={showCheckout ? handleBackToCart : closeCart} 
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 ${
        showCheckout ? 'w-full max-w-6xl' : 'w-full max-w-md'
      }`}>
        <div className="flex flex-col h-full">
          {showCheckout ? (
            <CheckoutForm onBack={handleBackToCart} />
          ) : (
            <>
              {/* Header */}
              <div className="relative p-6 border-b bg-gradient-to-r from-background to-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Tu Carrito</h2>
                      <p className="text-sm text-muted-foreground">
                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closeCart}
                    className="rounded-full hover:bg-muted hover:rotate-90 transition-all duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
            
            {/* Progress bar
            {totalItems > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Envío gratis desde $1000</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min((totalPrice / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )} */}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-8 rounded-3xl bg-muted/30 mb-6">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
                <p className="text-muted-foreground mb-6">
                  Agrega productos para comenzar tu compra
                </p>
                <Button 
                  onClick={closeCart}
                  className="rounded-full px-6"
                >
                  Ir a la tienda
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {state.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="group relative flex gap-4 p-4 border-2 rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {item.size && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-1 right-1 text-xs px-1.5 py-0.5"
                        >
                          {item.size}
                        </Badge>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-all flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-background"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-background"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={
                              item.stock !== undefined && 
                              !item.allowOutOfStock && 
                              item.quantity >= item.stock
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.stock !== undefined && (
                        <div className="text-xs">
                          {item.quantity > item.stock && !item.allowOutOfStock ? (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Sin stock disponible</span>
                            </div>
                          ) : item.stock <= 5 && item.stock > 0 ? (
                            <div className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Últimas {item.stock} unidades</span>
                            </div>
                          ) : item.stock === 0 && item.allowOutOfStock ? (
                            <div className="flex items-center gap-1 text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Sin stock - Se enviará cuando esté disponible</span>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Subtotal */}
                      <div className="text-xs text-muted-foreground">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t bg-gradient-to-t from-muted/20 to-background p-6 space-y-4">
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Envío 24-48h</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>Mejor precio</span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium">
                    {totalPrice >= 1000 ? 'GRATIS' : '$50.00'}
                  </span>
                </div> */}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t border-b">
                <span className="text-lg font-bold">TOTAL</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  $ {totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button 
                className="w-full h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-accent"
                size="lg"
                onClick={handleCheckout}
              >
                FINALIZAR COMPRA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Continue Shopping */}
              <Button 
                variant="ghost" 
                className="w-full rounded-xl"
                onClick={closeCart}
              >
                Continuar comprando
              </Button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </>
  )
}