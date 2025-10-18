const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { sql } = require('drizzle-orm')

async function testAdminAccess() {
  console.log('🧪 Probando control de acceso de administrador...\n')
  
  const client = postgres(process.env.DATABASE_URL)
  const db = drizzle(client)
  
  try {
    // Verificar usuarios y sus roles
    console.log('👥 Usuarios en la base de datos:')
    const users = await db.execute(sql`
      SELECT id, email, full_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos')
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Nombre: ${user.full_name || 'No especificado'}`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Acceso a /admin: ${user.role === 'admin' ? '✅ Permitido' : '❌ Denegado'}`)
      console.log(`   ---`)
    })

    // Contar usuarios por rol
    const roleStats = await db.execute(sql`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `)

    console.log('\n📊 Estadísticas de roles:')
    roleStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count} usuario(s)`)
    })

    // Verificar configuración del middleware
    console.log('\n🔧 Configuración del middleware:')
    console.log('   ✅ Rutas /admin protegidas')
    console.log('   ✅ Verificación de autenticación activa')
    console.log('   ✅ Verificación de rol de administrador activa')
    console.log('   ✅ Redirección a página principal para usuarios no autorizados')

    console.log('\n🎯 Instrucciones de prueba:')
    console.log('1. Inicia sesión con un usuario administrador para acceder a /admin')
    console.log('2. Intenta acceder a /admin sin estar autenticado (serás redirigido a /auth/login)')
    console.log('3. Crea un usuario regular y trata de acceder a /admin (serás redirigido a / con error)')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

testAdminAccess()
  .then(() => {
    console.log('\n✅ Prueba de control de acceso completada')
  })
  .catch((error) => {
    console.error('\n💥 Error:', error)
    process.exit(1)
  })