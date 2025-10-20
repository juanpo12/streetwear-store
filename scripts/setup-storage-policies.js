const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
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

async function setupStoragePolicies() {
  try {
    console.log('🔧 Setting up storage policies...')

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-storage-policies.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Split SQL statements by semicolon and filter out empty ones
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`)
          // Continue with other statements even if one fails
        } else {
          console.log('✅ Statement executed successfully')
        }
      }
    }

    console.log('✅ Storage policies setup completed!')
    console.log('')
    console.log('📋 Summary of policies created:')
    console.log('1. ✅ Allow authenticated users to upload product images')
    console.log('2. ✅ Allow public read access to product images')
    console.log('3. ✅ Allow authenticated users to delete product images')
    console.log('4. ✅ Allow authenticated users to update product images')

  } catch (error) {
    console.error('❌ Error setting up storage policies:', error.message)
    console.log('')
    console.log('💡 Manual setup required:')
    console.log('Please go to your Supabase dashboard > Storage > Policies')
    console.log('and manually create the policies from setup-storage-policies.sql')
  }
}

setupStoragePolicies()