"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState } from "react"
import { useCart } from "./cart-provider"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { toggleCart, totalItems } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-streetwear-md text-primary">
            URBAN
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm font-medium hover:text-accent transition-colors">
              SHOP
            </Link>
            <Link href="/collections" className="text-sm font-medium hover:text-accent transition-colors">
              COLLECTIONS
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">
              ABOUT
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/shop" className="text-sm font-medium hover:text-accent transition-colors">
                SHOP
              </Link>
              <Link href="/collections" className="text-sm font-medium hover:text-accent transition-colors">
                COLLECTIONS
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">
                ABOUT
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
