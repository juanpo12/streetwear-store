import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories, productImages, productVariants } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Función para verificar conectividad de base de datos
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Verificar si las variables de entorno están configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return false
    }
    
    // Intentar una consulta simple y rápida
    await db.select().from(products).limit(1)
    return true
  } catch (error) {
    console.log('Database unavailable:', error)
    return false
  }
}

// Función para formatear precio a pesos argentinos
function formatPriceToARS(priceUSD: number): string {
  // Convertir USD a ARS (usando una tasa de cambio aproximada)
  // En un entorno real, esto debería venir de una API de cambio
  const exchangeRate = 1000 // 1 USD = 1000 ARS aproximadamente
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const id = searchParams.get('id')

    // Verificar disponibilidad de base de datos ANTES de intentar conectar
    const dbAvailable = await isDatabaseAvailable()
    
    if (!dbAvailable) {
      console.log('Database not available, returning empty products list')
      
      // Devolver lista vacía cuando la base de datos no está disponible
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No hay productos disponibles en este momento'
      })
    }

    // Si la base de datos está disponible, proceder con las consultas normales
    try {
      // Si se solicita un producto específico por ID
      if (id) {
        const product = await db
          .select({
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            categoryName: categories.name,
            isActive: products.isActive,
            isFeatured: products.isFeatured,
            createdAt: products.createdAt
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(eq(products.id, id))
          .limit(1)

        if (product.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          )
        }

        // Obtener imágenes del producto
        const images = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, id))

        // Obtener variantes del producto (para tallas)
        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, id))

        const productData = product[0]
        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          price: formatPriceToARS(parseFloat(productData.price)),
          priceNumeric: parseFloat(productData.price),
          image: images.length > 0 ? images[0].url : '/placeholder.svg',
          category: productData.categoryName || 'GENERAL',
          description: productData.description || '',
          sizes: [...new Set(variants.map(v => v.title).filter(Boolean))],
          colors: ['Black'], // Por ahora hardcodeado, se puede expandir
          inStock: productData.isActive,
          featured: productData.isFeatured
        }

        return NextResponse.json({
          success: true,
          data: [formattedProduct],
          total: 1
        })
      }

      // Aplicar filtros
      const conditions = [eq(products.isActive, true)]

      if (category) {
        conditions.push(eq(categories.name, category))
      }

      if (featured === 'true') {
        conditions.push(eq(products.isFeatured, true))
      }

      // Ejecutar query con condiciones
      const productsData = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          categoryName: categories.name,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(products.createdAt)

      // Obtener imágenes para todos los productos
      const productIds = productsData.map(p => p.id)
      let allImages = []
      let allVariants = []
      
      if (productIds.length > 0) {
        allImages = await db
          .select()
          .from(productImages)
          .where(sql`${productImages.productId} = ANY(${sql.raw(`ARRAY[${productIds.map(id => `'${id}'::uuid`).join(',')}]`)})`)

        // Obtener variantes para todos los productos (para tallas)
        allVariants = await db
          .select()
          .from(productVariants)
          .where(sql`${productVariants.productId} = ANY(${sql.raw(`ARRAY[${productIds.map(id => `'${id}'::uuid`).join(',')}]`)})`)
      }

      // Formatear productos
      const formattedProducts = productsData.map(product => {
        const productImgs = allImages.filter(img => img.productId === product.id)
        const productVars = allVariants.filter(variant => variant.productId === product.id)
        
        return {
          id: product.id,
          name: product.name,
          price: formatPriceToARS(parseFloat(product.price)),
          priceNumeric: parseFloat(product.price),
          image: productImgs.length > 0 ? productImgs[0].url : '/placeholder.svg',
          category: product.categoryName || 'GENERAL',
          description: product.description || '',
          sizes: [...new Set(productVars.map(v => v.title).filter(Boolean))],
          colors: ['Black'], // Por ahora hardcodeado, se puede expandir
          inStock: product.isActive,
          featured: product.isFeatured
        }
      })

      // Aplicar límite si se especifica
      let finalProducts = formattedProducts
      if (limit) {
        const limitNum = parseInt(limit)
        if (!isNaN(limitNum)) {
          finalProducts = formattedProducts.slice(0, limitNum)
        }
      }

      return NextResponse.json({
        success: true,
        data: finalProducts,
        total: finalProducts.length
      })

    } catch (dbError) {
      console.error('Database query failed:', dbError)
      
      // Si falla la consulta, devolver lista vacía
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No hay productos disponibles en este momento'
      })
    }

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}