"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu, X, Search, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useCart } from "./cart-provider"
import { SearchModal } from "./search-modal"
import { useSearch } from "./search-provider"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { toggleCart, totalItems } = useCart()
  const { toggleSearch } = useSearch()
  const { user, loading, signOut, isAuthenticated } = useAuth()
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
            
            {/* Authentication */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        {user?.user_metadata?.first_name || user?.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Mi Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">Mis Pedidos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist">Lista de Deseos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/auth/login">Iniciar Sesión</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/register">Registrarse</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
            
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
              
              {/* Mobile Authentication */}
              {!loading && (
                <div className="border-t pt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-2">
                        {user?.user_metadata?.first_name || user?.email}
                      </div>
                      <Link href="/profile" className="block text-sm font-medium hover:text-accent transition-colors">
                        Mi Perfil
                      </Link>
                      <Link href="/orders" className="block text-sm font-medium hover:text-accent transition-colors">
                        Mis Pedidos
                      </Link>
                      <Link href="/wishlist" className="block text-sm font-medium hover:text-accent transition-colors">
                        Lista de Deseos
                      </Link>
                      <button 
                        onClick={signOut} 
                        className="block text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="block text-sm font-medium hover:text-accent transition-colors">
                        Iniciar Sesión
                      </Link>
                      <Link href="/auth/register" className="block text-sm font-medium hover:text-accent transition-colors">
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
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
