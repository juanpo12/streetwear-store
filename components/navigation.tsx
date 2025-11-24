"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu, X, Search, Settings } from "lucide-react"
import { useState } from "react"
import { useCart } from "./cart-provider"
import { SearchModal } from "./search-modal"
import { useSearch } from "./search-provider"
import { UserProfileDropdown } from "./user-profile-dropdown"
import { useAdmin } from "@/hooks/use-admin"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { toggleCart, totalItems } = useCart()
  const { toggleSearch } = useSearch()
  const { isAdmin, loading: adminLoading } = useAdmin()

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-cover rounded-full shadow-lg ring-2 ring-background/20 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 group-hover:ring-accent/30"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/tienda" className="text-sm font-medium hover:text-accent transition-colors" aria-label="Ir a la tienda">
              TIENDA
            </Link>
            <Link href="/collections" className="text-sm font-medium hover:text-accent transition-colors" aria-label="Ver colecciones">
              COLECCIONES
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors" aria-label="Acerca de">
              ACERCA DE
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleSearch}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            {/* Admin Button - Solo visible para administradores */}
            {!adminLoading && isAdmin && (
              <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                <Link href="/admin" title="Panel de Administración">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <UserProfileDropdown />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/tienda" className="text-sm font-medium hover:text-accent transition-colors" aria-label="Ir a la tienda">
                TIENDA
              </Link>
              <Link href="/collections" className="text-sm font-medium hover:text-accent transition-colors" aria-label="Ver colecciones">
                COLECCIONES
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors" aria-label="Acerca de">
                ACERCA DE
              </Link>
              {/* Admin Link - Solo visible para administradores en móvil */}
              {!adminLoading && isAdmin && (
                <Link href="/admin" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  ADMINISTRACIÓN
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </nav>
  )
}
