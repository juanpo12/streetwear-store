import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories, productImages, productVariants, users } from '@/lib/db/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
// import { cookies } from 'next/headers' // Commented out as requested

// Función para verificar conectividad de base de datos
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Validar que exista la URL de base de datos
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL missing')
      return false
    }

    // Intentar una consulta simple y rápida
    await db.select({ id: products.id }).from(products).limit(1)
    return true
  } catch (error) {
    console.log('Database unavailable:', error)
    return false
  }
}

// Función para formatear precio sin alterar el valor original
function formatPriceToARS(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
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
    const excludeUncategorized = searchParams.get('excludeUncategorized') === 'true'
    const noCategory = searchParams.get('noCategory') === 'true'
    const lowStock = searchParams.get('lowStock')
    const excludeOutOfStock = searchParams.get('excludeOutOfStock') === 'true'

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
        let images: { url: string; altText: string | null; position: number }[] = []
        try {
          images = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, id))
            .orderBy(productImages.position)
        } catch (e) {
          console.error('Failed to fetch product images:', e)
          images = []
        }

        // Obtener variantes del producto (para tallas)
        let variants: { title: string; sku: string | null }[] = []
        try {
          variants = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, id))
        } catch (e) {
          console.error('Failed to fetch product variants:', e)
          variants = []
        }

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

        // Calcular stock total considerando variantes
        const variantsWithStock = (variants || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          inventoryQuantity: v.inventoryQuantity ?? 0,
          isActive: v.isActive ?? true,
        }));

        // Si hay variantes, usar el stock de las variantes activas; si no, usar el stock del producto
        const totalStock = variantsWithStock.length > 0 
          ? variantsWithStock.filter(v => v.isActive).reduce((sum, v) => sum + v.inventoryQuantity, 0)
          : (productData.stock || 0);

        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          price: formatPriceToARS(parseFloat(productData.price)),
          priceNumeric: parseFloat(productData.price),
          compareAtPrice: variantsWithStock.length > 0 && variantsWithStock[0].compareAtPrice 
            ? formatPriceToARS(parseFloat(variantsWithStock[0].compareAtPrice))
            : null,
          compareAtPriceNumeric: variantsWithStock.length > 0 && variantsWithStock[0].compareAtPrice 
            ? parseFloat(variantsWithStock[0].compareAtPrice)
            : null,
          stock: productData.stock || 0,
          image: images.length > 0 ? images[0].url : '/placeholder.svg',
          images: images.map(img => ({ url: img.url, altText: img.altText })),
          category: productData.categoryName || 'GENERAL',
          description: productData.description || '',
          sizes: Array.from(new Set([ ...sizesFromTitle, ...sizesFromSku ])),
          colors: Array.from(new Set([ ...colorsFromTitle, ...colorsFromSku ])),
          inStock: productData.isActive && totalStock > 0,
          featured: productData.isFeatured,
          variants: variantsWithStock,
          onSale: variantsWithStock.length > 0 && variantsWithStock[0].compareAtPrice 
            ? parseFloat(variantsWithStock[0].compareAtPrice) > parseFloat(productData.price)
            : false,
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

      if (excludeUncategorized) {
        conditions.push(sql`${products.categoryId} IS NOT NULL`)
      }

      if (noCategory) {
        conditions.push(sql`${products.categoryId} IS NULL`)
      }

      // Nota: filtros de stock se aplican luego de obtener variantes

      // Ejecutar query con condiciones
      const productsData = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
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
      let allImages: { productId: string; url: string; altText: string | null; position: number }[] = []
      let allVariants: { productId: string; title: string; sku: string | null }[] = []
      
      if (productIds.length > 0) {
        try {
          allImages = await db
            .select()
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
            .orderBy(productImages.position)
        } catch (e) {
          console.error('Failed to fetch product images:', e)
          allImages = []
        }

        // Obtener variantes para todos los productos (para tallas)
        try {
          allVariants = await db
            .select()
            .from(productVariants)
            .where(inArray(productVariants.productId, productIds))
        } catch (e) {
          console.error('Failed to fetch product variants:', e)
          allVariants = []
        }
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

        const priceNum = parseFloat(product.price)
        const compareNum = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null
        const onSale = compareNum !== null && compareNum > priceNum

        // Calcular stock total considerando variantes activas
        const variantsWithStock = (productVars || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          inventoryQuantity: v.inventoryQuantity ?? 0,
          isActive: v.isActive ?? true,
        }))

        const totalStock = variantsWithStock.length > 0
          ? variantsWithStock.filter(v => v.isActive).reduce((sum, v) => sum + v.inventoryQuantity, 0)
          : (product.stock || 0)
        
        return {
          id: product.id,
          name: product.name,
          price: formatPriceToARS(priceNum),
          priceNumeric: priceNum,
          compareAtPrice: compareNum !== null ? formatPriceToARS(compareNum) : undefined,
          compareAtPriceNumeric: compareNum !== null ? compareNum : undefined,
          // stock total considerando variantes activas; si no hay variantes, usar stock del producto
          stock: totalStock,
          image: productImgs.length > 0 ? productImgs[0].url : '/placeholder.svg',
          category: product.categoryName || 'GENERAL',
          description: product.description || '',
          sizes: Array.from(new Set([ ...sizesFromTitle, ...sizesFromSku ])),
          colors: Array.from(new Set([ ...colorsFromTitle, ...colorsFromSku ])),
          inStock: product.isActive && totalStock > 0,
          featured: product.isFeatured,
          onSale: onSale
        }
      })

      // Aplicar filtros por stock basados en variantes
      let finalProducts = formattedProducts
      if (excludeOutOfStock) {
        finalProducts = finalProducts.filter(p => p.inStock)
      }
      if (lowStock) {
        const threshold = Number.parseInt(lowStock, 10)
        if (Number.isFinite(threshold)) {
          finalProducts = finalProducts.filter(p => p.stock <= threshold)
        }
      }

      // Aplicar límite si se especifica
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
      sizeStocks,
      sizeColorStocks,
    } = body

    if (!name || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ success: false, error: 'Nombre y precio válido son requeridos' }, { status: 400 })
    }
    if (Array.isArray(sizes) && sizes.length > 0) {
      const invalidNumeric = sizes.some((s: any) => {
        const v = String(s).trim()
        if (/^\d+$/.test(v)) return parseInt(v) <= 0
        return v.length === 0
      })
      if (invalidNumeric) {
        return NextResponse.json({ success: false, error: 'Talles inválidos: deben ser texto no vacío o números positivos' }, { status: 400 })
      }
    }
    if (sizeStocks && typeof sizeStocks === 'object') {
      const invalidStock = Object.values(sizeStocks).some((v) => typeof v !== 'number' || v < 0 || !Number.isFinite(v))
      if (invalidStock) {
        return NextResponse.json({ success: false, error: 'Stock por talle inválido: debe ser número no negativo' }, { status: 400 })
      }
    }
    if (sizeColorStocks && typeof sizeColorStocks === 'object') {
      const invalidNested = Object.values(sizeColorStocks).some((perColor: any) =>
        Object.values(perColor || {}).some((v: any) => typeof v !== 'number' || v < 0 || !Number.isFinite(v))
      )
      if (invalidNested) {
        return NextResponse.json({ success: false, error: 'Stock por talle y color inválido: debe ser número no negativo' }, { status: 400 })
      }
    }

    // Generador simple de SKU
    const generateSKU = (productName: string) => {
      const prefix = productName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
      const timestamp = Date.now().toString().slice(-6)
      return `${prefix}-${timestamp}`
    }

    const baseSKU = generateSKU(name)

    // Preparar slug
    const slug = name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : undefined

    // Insertar producto principal
    const inserted = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        shortDescription,
        price: price.toString(),
        compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
        categoryId: categoryId || null,
        stock: stock ?? 0,
        weight: weight ? weight.toString() : null,
        tags,
        metaTitle,
        metaDescription,
        isFeatured: !!isFeatured,
        isActive: isActive ?? true,
      })
      .returning({ id: products.id, name: products.name, slug: products.slug, price: products.price, compareAtPrice: products.compareAtPrice })

    const productId = inserted[0].id

    // Insertar imágenes
    if (Array.isArray(images) && images.length > 0) {
      const imageInserts = images.map((imageUrl: string, index: number) => ({
        productId,
        url: imageUrl,
        altText: `${name} - Imagen ${index + 1}`,
        position: index + 1,
      }))
      await db.insert(productImages).values(imageInserts)
    }

    // Construir variantes según talles y colores
    const defaultSizes = ['S','M','L','XL','XXL']
    const sizesToUse = Array.isArray(sizes) && sizes.length > 0
      ? Array.from(new Set(sizes.map((s: any) => String(s).trim()).filter(Boolean)))
      : defaultSizes
    const colorsToUse = Array.isArray(colors) && colors.length > 0 ? colors : ['Color Único']

    const variants: any[] = []
    for (const size of sizesToUse) {
      for (const color of colorsToUse) {
        const variantTitle = sizesToUse.length === 1 && colorsToUse.length === 1
          ? 'Variante por defecto'
          : `${size} / ${color}`

        const inventoryForVariant = (sizeColorStocks && sizeColorStocks[color] && typeof sizeColorStocks[color][size] === 'number')
          ? sizeColorStocks[color][size]
          : ((sizeStocks && typeof sizeStocks[size] === 'number') ? sizeStocks[size] : 0)

        variants.push({
          productId,
          title: variantTitle,
          price: price.toString(),
          compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
          sku: `${baseSKU}-${String(size).toLowerCase()}-${String(color).toLowerCase()}`,
          inventoryQuantity: inventoryForVariant,
          position: variants.length,
          isActive: true,
        })
      }
    }

    if (variants.length > 0) {
      await db.insert(productVariants).values(variants)
    }

    // Calcular campos de precio y rebaja para la respuesta
    const insertedProduct = inserted[0]
    const priceNum = parseFloat(insertedProduct.price)
    const compareNum = insertedProduct.compareAtPrice ? parseFloat(insertedProduct.compareAtPrice) : null
    const onSale = compareNum !== null && compareNum > priceNum

    // Responder con el producto creado incluyendo compareAtPrice y onSale
    return NextResponse.json({
      success: true,
      data: {
        id: productId,
        name: insertedProduct.name,
        slug: insertedProduct.slug,
        price: formatPriceToARS(priceNum),
        priceNumeric: priceNum,
        compareAtPrice: compareNum !== null ? formatPriceToARS(compareNum) : undefined,
        compareAtPriceNumeric: compareNum !== null ? compareNum : undefined,
        onSale: onSale,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
