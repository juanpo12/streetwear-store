import { ProductCard } from "@/components/product-card"

const collections = [
  {
    id: "oversized",
    name: "ESENCIALES OVERSIZE",
    description: "Cortes amplios que definen la calle",
    image: "/oversized-streetwear-collection-hoodies-and-tees.jpg",
    products: [
      {
        id: 1,
        name: "Buzo Oversize",
        price: 89,
        image: "/oversized-black-hoodie-streetwear.png",
        category: "Hoodies",
      },
      {
        id: 2,
        name: "BOXY TEE",
        price: 45,
        image: "/boxy-fit-white-t-shirt-streetwear.jpg",
        category: "Remeras",
      },
      {
        id: 3,
        name: "Cargo Ancho",
        price: 120,
        image: "/wide-cargo-pants-streetwear-urban.jpg",
        category: "Pants",
      },
    ],
  },
  {
    id: "urban",
    name: "CLÁSICOS URBANOS",
    description: "Piezas atemporales con actitud urbana",
    image: "/urban-streetwear-collection-jackets-and-accessorie.jpg",
    products: [
      {
        id: 4,
        name: "Campera Bomber",
        price: 150,
        image: "/black-bomber-streetwear.png",
        category: "Jackets",
      },
      {
        id: 5,
        name: "BUCKET HAT",
        price: 35,
        image: "/black-bucket-hat-streetwear.jpg",
        category: "Accesorios",
      },
      {
        id: 6,
        name: "Pantalón Deportivo",
        price: 85,
        image: "/black-track-pants-streetwear.jpg",
        category: "Pants",
      },
    ],
  },
]

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-streetwear-lg mb-4">COLECCIONES</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lanzamientos curados que definen la cultura. Cada colección cuenta una historia de expresión urbana y estilo auténtico.
          </p>
        </div>

        <div className="space-y-16">
          {collections.map((collection) => (
            <div key={collection.id} className="space-y-8">
              {/* Collection Header */}
              <div className="text-center space-y-4">
                <h2 className="text-streetwear-md">{collection.name}</h2>
                <p className="text-muted-foreground">{collection.description}</p>
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                </div>
              </div>

              {/* Collection Products */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
