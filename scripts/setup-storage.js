const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  console.log('🚀 Configurando Supabase Storage...');

  try {
    // 1. Crear bucket para imágenes de productos si no existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError);
      return;
    }

    const productsBucket = buckets.find(bucket => bucket.name === 'products');
    
    if (!productsBucket) {
      console.log('📦 Creando bucket "products"...');
      const { data, error } = await supabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        console.error('❌ Error creando bucket:', error);
        return;
      }
      console.log('✅ Bucket "products" creado exitosamente');
    } else {
      console.log('✅ Bucket "products" ya existe');
    }

    // 2. Subir imágenes existentes
    await uploadExistingImages();

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function uploadExistingImages() {
  console.log('📸 Subiendo imágenes existentes...');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const imageFiles = fs.readdirSync(publicDir).filter(file => 
    /\.(jpg|jpeg|png|webp)$/i.test(file) && !file.includes('placeholder')
  );

  console.log(`📁 Encontradas ${imageFiles.length} imágenes para subir`);

  for (const imageFile of imageFiles) {
    try {
      const filePath = path.join(publicDir, imageFile);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Verificar si la imagen ya existe
      const { data: existingFile } = await supabase.storage
        .from('products')
        .list('', { search: imageFile });

      if (existingFile && existingFile.length > 0) {
        console.log(`⏭️  ${imageFile} ya existe, saltando...`);
        continue;
      }

      // Subir imagen
      const { data, error } = await supabase.storage
        .from('products')
        .upload(imageFile, fileBuffer, {
          contentType: `image/${path.extname(imageFile).slice(1)}`,
          upsert: false
        });

      if (error) {
        console.error(`❌ Error subiendo ${imageFile}:`, error);
      } else {
        console.log(`✅ ${imageFile} subido exitosamente`);
      }

    } catch (error) {
      console.error(`❌ Error procesando ${imageFile}:`, error);
    }
  }

  console.log('🎉 Proceso de subida completado');
}

// Función para obtener URL pública de una imagen
function getPublicImageUrl(imageName) {
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(imageName);
  
  return data.publicUrl;
}

// Exportar función para uso en otros scripts
module.exports = { setupStorage, getPublicImageUrl };

// Ejecutar si se llama directamente
if (require.main === module) {
  setupStorage();
}