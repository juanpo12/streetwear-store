import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { ErrorAlert } from "@/components/error-alert"
import { Suspense } from "react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <ErrorAlert />
      </Suspense>
      <HeroSection />
      <FeaturedProducts />
      <CTASection />
      <Footer />
    </div>
  )
}
