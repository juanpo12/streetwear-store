const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔄 Probando conexión a la base de datos...');
  
  try {
    // Crear conexión
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);
    
    // Probar consulta simple
    const result = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('✅ Conexión exitosa!');
    console.log(`📊 Tablas encontradas (${result.length}):`);
    
    result.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });
    
    // Cerrar conexión
    await client.end();
    
    console.log('\n🎉 ¡Base de datos configurada correctamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();