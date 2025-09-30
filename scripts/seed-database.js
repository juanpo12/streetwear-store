const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { createClient } = require('@supabase/supabase-js');
const { sql } = require('drizzle-orm');
require('dotenv').config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para obtener URL pública de imagen
function getImageUrl(imageName) {
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(imageName);
  return data.publicUrl;
}

// Datos de categorías
const categoriesData = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts', description: 'Comfortable and stylish hoodies and sweatshirts' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'T-Shirts', slug: 't-shirts', description: 'Premium streetwear t-shirts' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Jackets', slug: 'jackets', description: 'Urban jackets and outerwear' },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Pants', slug: 'pants', description: 'Streetwear pants and bottoms' },
  { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Accessories', slug: 'accessories', description: 'Streetwear accessories and hats' }
];

// Datos de productos
const productsData = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Oversized Black Hoodie',
    slug: 'oversized-black-hoodie',
    description: 'Premium oversized hoodie in classic black. Made with high-quality cotton blend for ultimate comfort and style.',
    price: '89.99',
    compare_at_price: '120.00',
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    sku: 'OSH-BLK-001',
    weight: '800',
    is_active: true,
    is_featured: true,
    images: ['oversized-black-hoodie.jpg', 'oversized-black-hoodie-streetwear.png']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Boxy White T-Shirt',
    slug: 'boxy-white-t-shirt',
    description: 'Relaxed fit boxy t-shirt in premium white cotton. Perfect for layering or wearing solo.',
    price: '39.99',
    compare_at_price: '55.00',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    sku: 'BWT-WHT-001',
    weight: '200',
    is_active: true,
    is_featured: true,
    images: ['boxy-white-t-shirt.jpg', 'boxy-fit-white-t-shirt-streetwear.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'Black Bomber Jacket',
    slug: 'black-bomber-jacket',
    description: 'Classic bomber jacket in sleek black. Features ribbed cuffs and hem with premium zip closure.',
    price: '149.99',
    compare_at_price: '200.00',
    category_id: '550e8400-e29b-41d4-a716-446655440003',
    sku: 'BBJ-BLK-001',
    weight: '600',
    is_active: true,
    is_featured: true,
    images: ['black-bomber-streetwear.png', 'bomber-jacket-streetwear.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'Wide Cargo Pants',
    slug: 'wide-cargo-pants',
    description: 'Comfortable wide-fit cargo pants with multiple pockets. Perfect for urban streetwear style.',
    price: '79.99',
    compare_at_price: '110.00',
    category_id: '550e8400-e29b-41d4-a716-446655440004',
    sku: 'WCP-KHK-001',
    weight: '500',
    is_active: true,
    is_featured: true,
    images: ['wide-cargo-pants-streetwear-urban.jpg', 'baggy-cargo-pants-streetwear.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    name: 'Black Bucket Hat',
    slug: 'black-bucket-hat',
    description: 'Classic bucket hat in black. Essential streetwear accessory for any outfit.',
    price: '29.99',
    compare_at_price: '40.00',
    category_id: '550e8400-e29b-41d4-a716-446655440005',
    sku: 'BBH-BLK-001',
    weight: '100',
    is_active: true,
    is_featured: false,
    images: ['black-bucket-hat-streetwear.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    name: 'Graphic Urban T-Shirt',
    slug: 'graphic-urban-t-shirt',
    description: 'Bold graphic t-shirt with urban streetwear design. Made from premium cotton.',
    price: '44.99',
    compare_at_price: '60.00',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    sku: 'GUT-GRY-001',
    weight: '220',
    is_active: true,
    is_featured: false,
    images: ['graphic-t-shirt-streetwear-urban.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    name: 'Cropped Denim Jacket',
    slug: 'cropped-denim-jacket',
    description: 'Trendy cropped denim jacket perfect for layering. Classic streetwear staple.',
    price: '99.99',
    compare_at_price: '130.00',
    category_id: '550e8400-e29b-41d4-a716-446655440003',
    sku: 'CDJ-BLU-001',
    weight: '700',
    is_active: true,
    is_featured: false,
    images: ['cropped-denim-jacket-streetwear.jpg', 'cropped-jacket.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    name: 'Black Track Pants',
    slug: 'black-track-pants',
    description: 'Comfortable track pants in classic black. Perfect for casual streetwear looks.',
    price: '69.99',
    compare_at_price: '90.00',
    category_id: '550e8400-e29b-41d4-a716-446655440004',
    sku: 'BTP-BLK-001',
    weight: '400',
    is_active: true,
    is_featured: false,
    images: ['black-track-pants-streetwear.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    name: 'Oversized Sweatshirt',
    slug: 'oversized-sweatshirt',
    description: 'Cozy oversized sweatshirt in premium cotton blend. Perfect for relaxed streetwear style.',
    price: '74.99',
    compare_at_price: '95.00',
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    sku: 'OSS-GRY-001',
    weight: '650',
    is_active: true,
    is_featured: false,
    images: ['oversized-sweatshirt-streetwear.jpg']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440019',
    name: 'Wide Leg Jeans',
    slug: 'wide-leg-jeans',
    description: 'Trendy wide leg jeans in classic denim. Essential for modern streetwear wardrobe.',
    price: '89.99',
    compare_at_price: '120.00',
    category_id: '550e8400-e29b-41d4-a716-446655440004',
    sku: 'WLJ-BLU-001',
    weight: '600',
    is_active: true,
    is_featured: false,
    images: ['wide-leg-jeans-streetwear.jpg']
  }
];

async function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // 1. Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await db.execute(sql`DELETE FROM product_images`);
    await db.execute(sql`DELETE FROM product_variants`);
    await db.execute(sql`DELETE FROM products`);
    await db.execute(sql`DELETE FROM categories`);

    // 2. Insertar categorías
    console.log('📂 Insertando categorías...');
    for (const category of categoriesData) {
      await db.execute(sql`
        INSERT INTO categories (id, name, slug, description, is_active, created_at, updated_at)
        VALUES (${category.id}, ${category.name}, ${category.slug}, ${category.description}, true, NOW(), NOW())
      `);
    }
    console.log(`✅ ${categoriesData.length} categorías insertadas`);

    // 3. Insertar productos
    console.log('🛍️ Insertando productos...');
    for (const product of productsData) {
      const { images, ...productData } = product;
      
      // Insertar producto
      await db.execute(sql`
        INSERT INTO products (
          id, name, slug, description, price, compare_at_price, category_id, 
          sku, weight, is_active, is_featured, created_at, updated_at
        )
        VALUES (
          ${productData.id}, ${productData.name}, ${productData.slug}, 
          ${productData.description}, ${productData.price}, ${productData.compare_at_price}, 
          ${productData.category_id}, ${productData.sku}, ${productData.weight}, 
          ${productData.is_active}, ${productData.is_featured}, NOW(), NOW()
        )
      `);
      
      // Insertar imágenes del producto
      for (let i = 0; i < images.length; i++) {
        const imageName = images[i];
        const imageUrl = getImageUrl(imageName);
        await db.execute(sql`
          INSERT INTO product_images (product_id, url, alt_text, position, created_at)
          VALUES (${productData.id}, ${imageUrl}, ${productData.name + ' - Image ' + (i + 1)}, ${i + 1}, NOW())
        `);
      }
      
      // Crear variantes básicas (diferentes tallas)
       const sizes = ['S', 'M', 'L', 'XL'];
       for (let i = 0; i < sizes.length; i++) {
         const size = sizes[i];
         // Generar ID único basado en el ID del producto y el índice de la talla
         const productIndex = productsData.findIndex(p => p.id === productData.id);
         const variantId = `550e8400-e29b-41d4-a716-${(446655440100 + productIndex * 10 + i).toString().padStart(12, '0')}`;
         await db.execute(sql`
           INSERT INTO product_variants (
             id, product_id, title, price, sku, inventory_quantity, 
             position, is_active, created_at, updated_at
           )
           VALUES (
             ${variantId}, ${productData.id}, ${size}, ${productData.price}, 
             ${productData.sku + '-' + size}, 25, ${i}, true, NOW(), NOW()
           )
         `);
       }
    }

    console.log(`✅ ${productsData.length} productos insertados con sus variantes e imágenes`);

    console.log('🎉 ¡Seed de la base de datos completado exitosamente!');
    console.log(`
📊 Resumen:
- ${categoriesData.length} categorías
- ${productsData.length} productos
- ${productsData.length * 4} variantes de productos
- ${productsData.reduce((acc, p) => acc + p.images.length, 0)} imágenes de productos
    `);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };