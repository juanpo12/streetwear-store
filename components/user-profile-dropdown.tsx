"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Heart, ShoppingBag, Package, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function UserProfileDropdown() {
  const { user, isAuthenticated, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  // Si no está autenticado, mostrar botón de login
  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/auth/login">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border z-[100]">
        <DropdownMenuLabel className="font-medium text-foreground">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                : user?.email?.split('@')[0] || 'Usuario'
              }
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/50">
          <Link href="/profile/favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Favoritos</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/50">
          <Link href="/profile/orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Estado de Pedidos</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/50">
          <Link href="/profile/history" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Historial de Compras</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
