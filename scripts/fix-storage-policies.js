require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupStoragePolicies() {
  console.log('🔧 Setting up storage policies...')

  try {
    // Primero, eliminar políticas existentes si existen
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON storage.objects;`
    ]

    for (const sql of dropPolicies) {
      console.log('Dropping existing policies...')
      try {
        await supabase.rpc('exec_sql', { sql })
      } catch (error) {
        // Ignorar errores si las políticas no existen
        console.log('Policy may not exist, continuing...')
      }
    }

    // Crear nuevas políticas
    const policies = [
      // Política para lectura pública
      `CREATE POLICY "Allow public read access to product images" 
       ON storage.objects FOR SELECT 
       USING (bucket_id = 'product-images');`,
      
      // Política para subida de archivos (usuarios autenticados)
      `CREATE POLICY "Allow authenticated users to upload product images" 
       ON storage.objects FOR INSERT 
       WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');`,
      
      // Política para eliminar archivos (usuarios autenticados)
      `CREATE POLICY "Allow authenticated users to delete product images" 
       ON storage.objects FOR DELETE 
       USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');`,
      
      // Política para actualizar archivos (usuarios autenticados)
      `CREATE POLICY "Allow authenticated users to update product images" 
       ON storage.objects FOR UPDATE 
       USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');`
    ]

    for (const sql of policies) {
      console.log('Creating policy...')
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) {
        console.error('Error creating policy:', error)
      } else {
        console.log('✅ Policy created successfully')
      }
    }

    // También habilitar RLS en el bucket si no está habilitado
    console.log('Enabling RLS on storage.objects...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;' 
    })
    
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled on storage.objects')
    }

    console.log('✅ Storage policies setup completed!')

  } catch (error) {
    console.error('❌ Error setting up storage policies:', error)
    process.exit(1)
  }
}

setupStoragePolicies()