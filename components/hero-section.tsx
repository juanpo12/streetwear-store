"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-muted overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="/urban-streetwear-model-wearing-oversized-hoodie-in.jpg"
                  alt="Fondo de streetwear urbano"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-background/70 to-background/20" />
              </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative text-center space-y-6 px-4 z-10"
      >
        <h1 className="text-streetwear-xl text-balance tracking-tight">ES INDUMENTARIA</h1>
        <p className="text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto text-balance">
          ES indumentaria para el estilo urbano moderno. Siluetas oversize, diseños audaces y calidad sin compromiso.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="bg-primary hover:bg-accent text-lg px-8" asChild>
              <Link href="/tienda" aria-label="Ir a la tienda">COMPRAR AHORA</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/collections" aria-label="Ver colecciones">VER COLECCIONES</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
