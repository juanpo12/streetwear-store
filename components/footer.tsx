import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-streetwear-md mb-4">URBAN</h3>
            <p className="text-muted-foreground">Premium streetwear for the modern urban lifestyle.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wide">Shop</h4>
            <div className="space-y-2 text-sm">
              <Link href="/shop" className="block hover:text-accent transition-colors">
                All Products
              </Link>
              <Link href="/hoodies" className="block hover:text-accent transition-colors">
                Hoodies
              </Link>
              <Link href="/tees" className="block hover:text-accent transition-colors">
                Tees
              </Link>
              <Link href="/bottoms" className="block hover:text-accent transition-colors">
                Bottoms
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wide">Support</h4>
            <div className="space-y-2 text-sm">
              <Link href="/contact" className="block hover:text-accent transition-colors">
                Contact
              </Link>
              <Link href="/sizing" className="block hover:text-accent transition-colors">
                Size Guide
              </Link>
              <Link href="/returns" className="block hover:text-accent transition-colors">
                Returns
              </Link>
              <Link href="/shipping" className="block hover:text-accent transition-colors">
                Shipping
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wide">Connect</h4>
            <div className="space-y-2 text-sm">
              <Link href="#" className="block hover:text-accent transition-colors">
                Instagram
              </Link>
              <Link href="#" className="block hover:text-accent transition-colors">
                Twitter
              </Link>
              <Link href="#" className="block hover:text-accent transition-colors">
                TikTok
              </Link>
              <Link href="#" className="block hover:text-accent transition-colors">
                YouTube
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>© 2025 Urban Threads. All rights reserved.</div>
            <div className="text-xs opacity-75">
              Created by <span className="font-medium text-foreground">Juan Diaz</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
