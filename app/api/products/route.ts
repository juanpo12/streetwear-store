import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories, productImages, productVariants, users } from '@/lib/db/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
// import { cookies } from 'next/headers' // Commented out as requested

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
// function getPublicImageUrl(imagePath: string): string {
//   if (!imagePath) return '/placeholder.svg'
  
//   const { data } = supabase.storage
//     .from('products')
//     .getPublicUrl(imagePath)
  
//   return data.publicUrl
// }

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
            stock: products.stock,
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
          .orderBy(productImages.position)

        // Obtener variantes del producto (para tallas)
        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, id))

        const productData = product[0]
        const sizesFromTitle = variants
          .map(v => (v.title.includes(' / ') ? v.title.split(' / ')[0] : v.title).trim())
          .filter(s => s && s.toLowerCase() !== 'variante por defecto' && s.toLowerCase() !== 'talla única')
        const sizesFromSku = variants
          .map(v => {
            const parts = v.sku ? v.sku.split('-') : []
            return parts.length >= 3 ? parts[parts.length - 2] : null
          })
          .filter(Boolean)
        const colorsFromTitle = variants
          .map(v => v.title.split(' / ')[1]?.trim())
          .filter(Boolean)
        const colorsFromSku = variants
          .map(v => {
            const parts = v.sku ? v.sku.split('-') : []
            return parts.length >= 1 ? parts[parts.length - 1] : null
          })
          .filter(Boolean)

        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          price: formatPriceToARS(parseFloat(productData.price)),
          priceNumeric: parseFloat(productData.price),
          stock: productData.stock || 0,
          image: images.length > 0 ? images[0].url : '/placeholder.svg',
          images: images.map(img => ({ url: img.url, altText: img.altText })),
          category: productData.categoryName || 'GENERAL',
          description: productData.description || '',
          sizes: Array.from(new Set([ ...sizesFromTitle, ...sizesFromSku ])),
          colors: Array.from(new Set([ ...colorsFromTitle, ...colorsFromSku ])),
          inStock: productData.isActive && (productData.stock || 0) > 0,
          featured: productData.isFeatured
        }

        return NextResponse.json({
          success: true,
          data: formattedProduct,
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
          stock: products.stock,
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
          .where(inArray(productImages.productId, productIds))
          .orderBy(productImages.position)

        // Obtener variantes para todos los productos (para tallas)
        allVariants = await db
          .select()
          .from(productVariants)
          .where(inArray(productVariants.productId, productIds))
      }

      // Formatear productos
      const formattedProducts = productsData.map(product => {
        const productImgs = allImages.filter(img => img.productId === product.id)
        const productVars = allVariants.filter(variant => variant.productId === product.id)
        const sizesFromTitle = productVars
          .map(v => (v.title.includes(' / ') ? v.title.split(' / ')[0] : v.title).trim())
          .filter(s => s && s.toLowerCase() !== 'variante por defecto' && s.toLowerCase() !== 'talla única')
        const sizesFromSku = productVars
          .map(v => {
            const parts = v.sku ? v.sku.split('-') : []
            return parts.length >= 3 ? parts[parts.length - 2] : null
          })
          .filter(Boolean)
        const colorsFromTitle = productVars
          .map(v => v.title.split(' / ')[1]?.trim())
          .filter(Boolean)
        const colorsFromSku = productVars
          .map(v => {
            const parts = v.sku ? v.sku.split('-') : []
            return parts.length >= 1 ? parts[parts.length - 1] : null
          })
          .filter(Boolean)
        
        return {
          id: product.id,
          name: product.name,
          price: formatPriceToARS(parseFloat(product.price)),
          priceNumeric: parseFloat(product.price),
          image: productImgs.length > 0 ? productImgs[0].url : '/placeholder.svg',
          category: product.categoryName || 'GENERAL',
          description: product.description || '',
          sizes: Array.from(new Set([ ...sizesFromTitle, ...sizesFromSku ])),
          colors: Array.from(new Set([ ...colorsFromTitle, ...colorsFromSku ])),
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

export async function POST(request: Request) {
  try {
    // Verificar autenticación usando cookies
    // const cookieStore = cookies()
    // const sessionToken = cookieStore.get('sb-access-token')?.value
    
    // if (!sessionToken) {
    //   return NextResponse.json(
    //     { success: false, error: 'No autorizado - No hay sesión activa' },
    //     { status: 401 }
    //   )
    // }

    // Verificar que el usuario existe en nuestra base de datos usando Drizzle
    // try {
    //   const userResult = await db.select().from(users).limit(1)
    //   if (!userResult.length) {
    //     return NextResponse.json(
    //       { success: false, error: 'Usuario no encontrado' },
    //       { status: 401 }
    //     )
    //   }
    // } catch (dbError) {
    //   console.error('Database error during auth check:', dbError)
    //   return NextResponse.json(
    //     { success: false, error: 'Error de conexión a la base de datos' },
    //     { status: 500 }
    //   )
    // }

    // Verificar disponibilidad de base de datos
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json({
        success: false,
        error: 'Base de datos no disponible'
      }, { status: 503 })
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      categoryId,
      stock,
      weight,
      tags,
      metaTitle,
      metaDescription,
      isFeatured,
      isActive,
      images,
      sizes,
      colors
    } = body

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    // Generar slug único
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Generar SKU automáticamente basado en el nombre del producto
    const generateSKU = (productName: string) => {
      const prefix = productName.toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6)
      const timestamp = Date.now().toString().slice(-6)
      return `${prefix}-${timestamp}`
    }

    const autoSKU = generateSKU(name)

    try {
      // Crear el producto
      const newProduct = await db
        .insert(products)
        .values({
          name,
          slug,
          description,
          shortDescription,
          price: price.toString(),
          compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
          categoryId: categoryId || null,
          sku: autoSKU,
          stock: stock || 0,
          weight: weight ? weight.toString() : null,
          weightUnit: 'kg',
          tags: tags || [],
          metaTitle,
          metaDescription,
          isFeatured: isFeatured || false,
          isActive: isActive !== false, // Por defecto true
          trackQuantity: true,
          continueSellingWhenOutOfStock: false,
          requiresShipping: true,
        })
        .returning({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt
        })

      const productId = newProduct[0].id

      // Agregar imágenes si existen
      if (images && images.length > 0) {
        const imageInserts = images.map((imageUrl: string, index: number) => ({
          productId,
          url: imageUrl,
          altText: `${name} - Imagen ${index + 1}`,
          position: index + 1
        }))

        await db.insert(productImages).values(imageInserts)
      }

      // Crear variantes si hay tallas y colores
      if (sizes && sizes.length > 0) {
        const variants = []
        const sizesToUse = sizes.length > 0 ? sizes : ['Talla Única']
        const colorsToUse = colors && colors.length > 0 ? colors : ['Color Único']

        for (const size of sizesToUse) {
          for (const color of colorsToUse) {
            const variantTitle = sizesToUse.length === 1 && colorsToUse.length === 1 
              ? 'Variante por defecto'
              : `${size} / ${color}`
            
            variants.push({
              productId,
              title: variantTitle,
              price: price.toString(),
              compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
              sku: autoSKU ? `${autoSKU}-${size.toLowerCase()}-${color.toLowerCase()}` : null,
              inventoryQuantity: 0,
              position: variants.length,
              isActive: true
            })
          }
        }

        if (variants.length > 0) {
          await db.insert(productVariants).values(variants)
        }
      }

      // Obtener el producto completo con imágenes
      const createdProduct = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          categoryName: categories.name,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, productId))
        .limit(1)

      const productImages_result = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))

      const finalProduct = {
        ...createdProduct[0],
        images: productImages_result
      }

      return NextResponse.json({
        success: true,
        data: finalProduct,
        message: 'Producto creado exitosamente'
      }, { status: 201 })

    } catch (dbError) {
      console.error('Database error creating product:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Error al crear el producto en la base de datos',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}