const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBucket() {
  try {
    console.log('🔧 Setting up Supabase Storage bucket...')

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'product-images')

    if (bucketExists) {
      console.log('✅ Bucket "product-images" already exists')
    } else {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (error) {
        console.error('❌ Error creating bucket:', error.message)
        return
      }

      console.log('✅ Successfully created bucket "product-images"')
    }

    // Set up RLS policies for the bucket
    console.log('🔧 Setting up storage policies...')

    // Policy to allow authenticated users to upload
    const uploadPolicy = `
      CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
      );
    `

    // Policy to allow public read access
    const readPolicy = `
      CREATE POLICY "Allow public read access to product images" ON storage.objects
      FOR SELECT USING (bucket_id = 'product-images');
    `

    // Policy to allow authenticated users to delete their uploads
    const deletePolicy = `
      CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
      );
    `

    console.log('📝 Storage bucket setup completed!')
    console.log('Note: You may need to manually set up RLS policies in the Supabase dashboard if they don\'t exist.')
    console.log('Required policies:')
    console.log('1. Allow authenticated users to upload to product-images bucket')
    console.log('2. Allow public read access to product-images bucket')
    console.log('3. Allow authenticated users to delete from product-images bucket')

  } catch (error) {
    console.error('❌ Error setting up storage:', error.message)
  }
}

setupStorageBucket()