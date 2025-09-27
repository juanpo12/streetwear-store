import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-streetwear-lg mb-6">JOIN THE MOVEMENT</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-balance">
          Be the first to know about new drops, exclusive releases, and streetwear culture updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded bg-primary-foreground text-primary placeholder:text-primary/60"
          />
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            SUBSCRIBE
          </Button>
        </div>
      </div>
    </section>
  )
}
