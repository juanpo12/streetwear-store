export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-streetwear-lg mb-6">ABOUT URBAN THREADS</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Born from the streets, crafted for the culture. We create oversized, boxy fits that speak the language of
            authentic urban expression.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-streetwear-md">OUR STORY</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2020, Urban Threads emerged from the underground streetwear scene with a simple mission:
                create clothing that reflects the raw authenticity of street culture.
              </p>
              <p>
                Every piece is designed with the oversized, boxy aesthetic that defines modern streetwear. We believe in
                comfort without compromise, style without pretense.
              </p>
              <p>
                From the concrete jungles to the digital realm, our threads connect communities and celebrate the
                diverse voices that make street culture what it is today.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img src="/streetwear-brand-story-urban-clothing-design-studi.jpg" alt="Urban Threads Story" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-accent-foreground">A</span>
            </div>
            <h3 className="text-streetwear-sm">AUTHENTIC</h3>
            <p className="text-muted-foreground text-sm">
              Real culture, real stories. No fake hype, just genuine street expression.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-accent-foreground">Q</span>
            </div>
            <h3 className="text-streetwear-sm">QUALITY</h3>
            <p className="text-muted-foreground text-sm">
              Premium materials and construction that stands up to street life.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-accent-foreground">C</span>
            </div>
            <h3 className="text-streetwear-sm">COMMUNITY</h3>
            <p className="text-muted-foreground text-sm">
              Built by the culture, for the culture. We&apos;re all part of the same movement.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-muted rounded-lg p-8">
          <h2 className="text-streetwear-md mb-4">GET IN TOUCH</h2>
          <p className="text-muted-foreground mb-6">Questions about our drops? Want to collaborate? Hit us up.</p>
          <div className="space-y-2 text-sm">
            <p>Email: hello@urbanthreads.com</p>
            <p>Instagram: @urbanthreads</p>
            <p>Based in: Los Angeles, CA</p>
          </div>
        </div>
      </div>
    </div>
  )
}
