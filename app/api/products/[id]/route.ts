import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories, productImages, productVariants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Función para verificar disponibilidad de base de datos
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await db.select().from(products).limit(1)
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Función para formatear precio a pesos argentinos
function formatPriceToARS(priceUSD: number): string {
  const exchangeRate = 1000 // 1 USD = 1000 ARS (aproximado)
  const priceARS = priceUSD * exchangeRate
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceARS)
}

// Función para obtener URL pública de imagen de Supabase Storage
function getPublicImageUrl(imagePath: string): string {
  if (!imagePath) return '/placeholder.svg'
  
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(imagePath)
  
  return data.publicUrl
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    // Verificar que el ID sea un UUID válido (formato básico)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(productId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de producto inválido'
      }, { status: 400 })
    }

    // Verificar disponibilidad de base de datos
    const dbAvailable = await isDatabaseAvailable()
    
    if (!dbAvailable) {
      console.log('Database not available, returning error')
      
      return NextResponse.json({
        success: false,
        error: 'Producto no disponible en este momento',
        message: 'La base de datos no está disponible'
      }, { status: 503 })
    }

    try {
      // Buscar el producto por ID
      const productResult = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          categoryName: categories.name,
          isActive: products.isActive,
          stock: products.stock,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.id, productId), eq(products.isActive, true)))
        .limit(1)

      if (productResult.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Producto no encontrado'
        }, { status: 404 })
      }

      const product = productResult[0]

      // Obtener imágenes del producto
      const imagesAll = await db
        .select({
          url: productImages.url,
          altText: productImages.altText,
          position: productImages.position
        })
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position)
      
      // Obtener variantes del producto (tallas, colores, etc.)
      const variants = await db
        .select({
          id: productVariants.id,
          title: productVariants.title,
          price: productVariants.price,
          sku: productVariants.sku,
          inventoryQuantity: productVariants.inventoryQuantity,
          isActive: productVariants.isActive
        })
        .from(productVariants)
        .where(and(
          eq(productVariants.productId, product.id),
          eq(productVariants.isActive, true)
        ))

      // Extraer tallas y colores únicos (robusto con título y SKU)
      const sizesFromTitle = variants
        .map(v => (v.title.includes(' / ') ? v.title.split(' / ')[0] : v.title).trim())
        .filter(s => s && s.toLowerCase() !== 'variante por defecto' && s.toLowerCase() !== 'talla única')
      const sizesFromSku = variants
        .map(v => {
          const parts = v.sku ? v.sku.split('-') : []
          return parts.length >= 3 ? parts[parts.length - 2] : null
        })
        .filter(Boolean)
      const sizes = Array.from(new Set([ ...sizesFromTitle, ...sizesFromSku ]))

      const colorsFromTitle = variants
        .map(v => {
          const parts = v.title.split(' / ')
          return parts[1]?.trim()
        })
        .filter(Boolean)
      const colorsFromSku = variants
        .map(v => {
          const parts = v.sku ? v.sku.split('-') : []
          return parts.length >= 1 ? parts[parts.length - 1] : null
        })
        .filter(Boolean)
      const colors = Array.from(new Set([ ...colorsFromTitle, ...colorsFromSku ]))

      // Formatear el producto final
      const finalProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: formatPriceToARS(parseFloat(product.price)),
        priceNumeric: parseFloat(product.price),
        image: imagesAll.length > 0 
          ? imagesAll[0].url
          : '/placeholder.svg',
        images: imagesAll.map(img => ({ url: img.url, altText: img.altText })),
        category: product.categoryName || 'Sin categoría',
        sizes: sizes.length > 0 ? sizes : ['Talla Única'],
        colors: colors.length > 0 ? colors : ['Negro'],
        inStock: product.isActive && ((product.stock || 0) > 0 || variants.some(v => (v.inventoryQuantity || 0) > 0)),
        featured: product.isFeatured,
        variants: variants
      }

      return NextResponse.json({
        success: true,
        data: finalProduct
      })

    } catch (dbError) {
      console.error('Database query failed:', dbError)
      
      return NextResponse.json({
        success: false,
        error: 'Error al obtener el producto',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}