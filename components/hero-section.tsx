import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-muted overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/urban-streetwear-model-wearing-oversized-hoodie-in.jpg"
          alt="Urban streetwear background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
      </div>

      <div className="relative text-center space-y-6 px-4 z-10">
        <h1 className="text-streetwear-xl text-balance">URBAN THREADS</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Premium streetwear for the modern urban lifestyle. Oversized fits, bold designs, uncompromising quality.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-accent text-lg px-8">
            SHOP NOW
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            VIEW COLLECTIONS
          </Button>
        </div>
      </div>
    </section>
  )
}
