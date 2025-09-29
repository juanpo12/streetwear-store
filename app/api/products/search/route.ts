import { NextResponse } from 'next/server'

// Mock product data - mismo que en /api/products pero para búsqueda
const mockProducts = [
  {
    id: 1,
    name: "Oversized Black Hoodie",
    price: 89,
    image: "/oversized-black-hoodie-streetwear.png",
    category: "HOODIES",
    description: "Premium oversized hoodie with streetwear aesthetic",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Gray"],
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: "Cargo Pants",
    price: 129,
    image: "/cargo-pants.png",
    category: "BOTTOMS",
    description: "Tactical cargo pants with multiple pockets",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Olive", "Khaki"],
    inStock: true,
    featured: true
  },
  {
    id: 3,
    name: "Bomber Jacket",
    price: 159,
    image: "/bomber-jacket-streetwear.jpg",
    category: "JACKETS",
    description: "Classic bomber jacket with modern streetwear twist",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Olive"],
    inStock: true,
    featured: false
  },
  {
    id: 4,
    name: "Graphic T-Shirt",
    price: 45,
    image: "/graphic-t-shirt-streetwear-urban.jpg",
    category: "TEES",
    description: "Urban graphic tee with bold streetwear design",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Gray"],
    inStock: true,
    featured: true
  },
  {
    id: 5,
    name: "Wide Leg Jeans",
    price: 119,
    image: "/wide-leg-jeans-streetwear.jpg",
    category: "BOTTOMS",
    description: "Relaxed fit wide leg jeans for comfort and style",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black", "Light Blue"],
    inStock: true,
    featured: false
  },
  {
    id: 6,
    name: "Black Bucket Hat",
    price: 35,
    image: "/black-bucket-hat-streetwear.jpg",
    category: "ACCESSORIES",
    description: "Classic bucket hat for streetwear enthusiasts",
    sizes: ["One Size"],
    colors: ["Black", "White", "Beige"],
    inStock: true,
    featured: false
  },
  {
    id: 7,
    name: "Boxy White T-Shirt",
    price: 39,
    image: "/boxy-fit-white-t-shirt-streetwear.jpg",
    category: "TEES",
    description: "Oversized boxy fit t-shirt in premium cotton",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Gray"],
    inStock: true,
    featured: true
  },
  {
    id: 8,
    name: "Oversized Sweatshirt",
    price: 75,
    image: "/oversized-sweatshirt-streetwear.jpg",
    category: "HOODIES",
    description: "Comfortable oversized sweatshirt for everyday wear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Gray", "Black", "Navy"],
    inStock: true,
    featured: false
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    let filteredProducts = [...mockProducts]

    // Buscar por query si se especifica
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    }

    // Filtrar por categoría si se especifica
    if (category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Limitar la cantidad de productos si se especifica
    if (limit) {
      const limitNum = parseInt(limit)
      if (!isNaN(limitNum)) {
        filteredProducts = filteredProducts.slice(0, limitNum)
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      query: query || '',
      category: category || null
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search products' },
      { status: 500 }
    )
  }
}