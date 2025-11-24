import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export const metadata = {
  title: "Colecciones | Urban Threads",
  description: "Próximamente: colecciones curadas con estilo urbano y calidad premium.",
}


export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-streetwear-lg mb-4">COLECCIONES</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lanzamientos curados que definen la cultura. Cada colección cuenta una historia de expresión urbana y estilo auténtico.
          </p>
          <div className="mt-6 inline-flex flex-col items-center gap-3 rounded-xl border bg-muted/60 p-6">
            <h2 className="text-streetwear-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              PRÓXIMAMENTE
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Estamos preparando colecciones épicas. Muy pronto disponibles.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-muted-foreground">Vuelve pronto para descubrir nuestras colecciones.</p>
          <div className="flex justify-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Volver a la tienda</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
