import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories, productImages } from '@/lib/db/schema'
import { eq, and, ilike, or, sql } from 'drizzle-orm'



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const excludeUncategorized = searchParams.get('excludeUncategorized') === 'true'

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    try {
      // Construir condiciones de búsqueda
      const searchConditions = [
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(categories.name, `%${query}%`)
        )
      ]

      // Agregar filtro de categoría si se especifica
      if (category) {
        searchConditions.push(eq(categories.name, category.toUpperCase()))
      }

      // Excluir productos sin categoría cuando se solicite explícitamente
      if (excludeUncategorized) {
        searchConditions.push(sql`${products.categoryId} IS NOT NULL`)
      }

      // Construir query base
      let searchQuery = db
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
        .where(and(...searchConditions))

      // Aplicar límite si se especifica
      if (limit) {
        const limitNum = Number.parseInt(limit, 10)
        if (Number.isFinite(limitNum) && limitNum > 0) {
          const safeLimit = Math.min(limitNum, 50)
          searchQuery = searchQuery.limit(safeLimit).offset(0) as any
        }
      }

      const searchResults = await searchQuery

      // Para cada producto, obtener su imagen principal
      const finalProducts = await Promise.all(
        searchResults.map(async (product) => {
          const primaryImage = await db
            .select({
              url: productImages.url,
              altText: productImages.altText
            })
            .from(productImages)
            .where(eq(productImages.productId, product.id))
            .orderBy(productImages.position)
            .limit(1)

          return {
            ...product,
            image: primaryImage.length > 0 
              ? primaryImage[0].url
              : '/placeholder.svg'
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: finalProducts,
        total: finalProducts.length,
        query
      })

    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search products' },
      { status: 500 }
    )
  }
}