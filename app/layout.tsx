import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { CartSidebar } from "@/components/cart-sidebar"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "URBAN THREADS - Streetwear Store",
  description: "Premium streetwear, boxy fits, oversized styles",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          <Navigation />
          <Suspense fallback={null}>{children}</Suspense>
          <CartSidebar />
          <Analytics />
        </CartProvider>
      </body>
    </html>
  )
}
