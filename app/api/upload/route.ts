import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

// Create Supabase client with service role key for storage operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieStore = cookies()
    // const sessionToken = cookieStore.get('sb-access-token')?.value
    
    // if (!sessionToken) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized - No session token' },
    //     { status: 401 }
    //   )
    // }

    // Verify user exists in our database using Drizzle
    try {
      const userResult = await db.select().from(users).limit(1)
      if (!userResult.length) {
        return NextResponse.json(
          { error: 'Unauthorized - User not found' },
          { status: 401 }
        )
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(async (file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file`)
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error(`${file.name} is too large (max 5MB)`)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Convert file to buffer
      const buffer = await file.arrayBuffer()

      // Upload to Supabase Storage using admin client (bypasses RLS)
      console.log(`Uploading file: ${file.name} to path: ${filePath}`)
      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error(`Upload error for ${file.name}:`, error)
        throw new Error(`Failed to upload ${file.name}: ${error.message}`)
      }
      
      console.log(`Successfully uploaded: ${file.name}`)

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return {
        originalName: file.name,
        fileName: fileName,
        filePath: filePath,
        url: publicUrl,
        size: file.size,
        type: file.type
      }
    })

    const results = await Promise.all(uploadPromises)

    return NextResponse.json({
      success: true,
      files: results
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('sb-access-token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      )
    }

    // Verify user exists in our database using Drizzle
    try {
      const userResult = await db.select().from(users).limit(1)
      if (!userResult.length) {
        return NextResponse.json(
          { error: 'Unauthorized - User not found' },
          { status: 401 }
        )
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Use admin client to delete file (bypasses RLS)
    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove([filePath])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}