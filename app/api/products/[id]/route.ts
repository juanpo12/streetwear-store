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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(productId)) {
      return NextResponse.json({ success: false, error: 'ID de producto inválido' }, { status: 400 })
    }

    // Verificar disponibilidad de base de datos
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json({ success: false, error: 'Base de datos no disponible' }, { status: 503 })
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
      colors,
    } = body

    // Generador simple de SKU
    const generateSKU = (productName: string) => {
      const prefix = productName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
      const timestamp = Date.now().toString().slice(-6)
      return `${prefix}-${timestamp}`
    }

    // Obtener producto existente para base de SKU
    const existingProduct = await db
      .select({ id: products.id, name: products.name, sku: products.sku, price: products.price })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (existingProduct.length === 0) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 })
    }

    const baseSKU = existingProduct[0].sku || generateSKU(name || existingProduct[0].name)

    // Preparar slug si cambia el nombre
    const slug = name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : undefined

    // Actualizar el producto (solo campos presentes)
    const updatedRows = await db
      .update(products)
      .set({
        ...(name !== undefined ? { name, slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(shortDescription !== undefined ? { shortDescription } : {}),
        ...(price !== undefined ? { price: price.toString() } : {}),
        ...(compareAtPrice !== undefined ? { compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
        ...(stock !== undefined ? { stock: stock ?? 0 } : {}),
        ...(weight !== undefined ? { weight: weight ? weight.toString() : null } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(metaTitle !== undefined ? { metaTitle } : {}),
        ...(metaDescription !== undefined ? { metaDescription } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      })
      .where(eq(products.id, productId))
      .returning({ id: products.id, name: products.name, slug: products.slug, price: products.price })

    const updatedProduct = updatedRows[0]

    // Actualizar imágenes si se envían en el body
    if (images !== undefined) {
      // Borrar todas las imágenes actuales y reinsertar
      await db.delete(productImages).where(eq(productImages.productId, productId))

      if (Array.isArray(images) && images.length > 0) {
        const imageInserts = images.map((imageUrl: string, index: number) => ({
          productId,
          url: imageUrl,
          altText: `${(updatedProduct?.name || name || 'Producto')} - Imagen ${index + 1}`,
          position: index + 1,
        }))
        await db.insert(productImages).values(imageInserts)
      }
    }

    // Actualizar variantes si se envían tallas/colores
    if (sizes !== undefined || colors !== undefined) {
      await db.delete(productVariants).where(eq(productVariants.productId, productId))

      const sizesToUse = Array.isArray(sizes) && sizes.length > 0 ? sizes : ['Talla Única']
      const colorsToUse = Array.isArray(colors) && colors.length > 0 ? colors : ['Color Único']

      const variants: any[] = []
      for (const size of sizesToUse) {
        for (const color of colorsToUse) {
          const variantTitle = sizesToUse.length === 1 && colorsToUse.length === 1
            ? 'Variante por defecto'
            : `${size} / ${color}`

          variants.push({
            productId,
            title: variantTitle,
            price: (price !== undefined ? price.toString() : updatedProduct.price),
            compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? compareAtPrice.toString() : null) : null,
            sku: baseSKU ? `${baseSKU}-${String(size).toLowerCase()}-${String(color).toLowerCase()}` : null,
            inventoryQuantity: 0,
            position: variants.length,
            isActive: true,
          })
        }
      }

      if (variants.length > 0) {
        await db.insert(productVariants).values(variants)
      }
    }

    // Obtener producto final con imágenes
    const productResult = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        categoryName: categories.name,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        stock: products.stock,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, productId))
      .limit(1)

    const imagesAll = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.position)

    const finalProduct = { ...productResult[0], images: imagesAll }

    return NextResponse.json({ success: true, data: finalProduct, message: 'Producto actualizado exitosamente' }, { status: 200 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}