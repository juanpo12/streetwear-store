const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { sql } = require('drizzle-orm')

async function promoteToAdmin(email) {
  console.log(`🔧 Promoviendo usuario ${email} a administrador...\n`)
  
  const client = postgres(process.env.DATABASE_URL)
  const db = drizzle(client)
  
  try {
    // Buscar el usuario por email
    const userRecord = await db.execute(sql`
      SELECT id, email, full_name, role 
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `)

    if (!userRecord.length) {
      console.log(`❌ Usuario con email ${email} no encontrado`)
      return
    }

    const user = userRecord[0]
    console.log(`👤 Usuario encontrado:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.full_name || user.email.split('@')[0]}`)
    console.log(`   Rol actual: ${user.role}`)

    if (user.role === 'admin') {
      console.log(`✅ El usuario ya es administrador`)
      return
    }

    // Actualizar el rol a admin
    await db.execute(sql`
      UPDATE users 
      SET role = 'admin', updated_at = NOW()
      WHERE id = ${user.id}
    `)

    console.log(`\n🎉 ¡Usuario promovido a administrador exitosamente!`)
    console.log(`   ${email} ahora tiene acceso completo al panel de administración`)
    
  } catch (error) {
    console.error('❌ Error al promover usuario:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

// Obtener email del argumento de línea de comandos o usar el email por defecto
const email = process.argv[2] || 'blackjpo12@gmail.com'

promoteToAdmin(email)
  .then(() => {
    console.log('\n✅ Operación completada')
    console.log('Ahora puedes acceder a /admin con este usuario')
  })
  .catch((error) => {
    console.error('\n💥 Error:', error)
    process.exit(1)
  })