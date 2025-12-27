"use client"
import { Button } from "@/components/ui/button"

export function CTASection() {

  const redirectToRegister = () => {
    window.location.href = "/auth/register"
  }
  
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-streetwear-lg mb-6">ÚNITE AL MOVIMIENTO</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-balance">
          Sé el primero en enterarte de nuevos lanzamientos, ediciones exclusivas y novedades de la cultura streetwear.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={redirectToRegister}>
            REGISTRARME
          </Button>
        </div>
      </div>
    </section>
  )
}
