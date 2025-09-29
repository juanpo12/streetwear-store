# Configuración de Supabase

Este documento te guiará a través del proceso de configuración de Supabase para tu tienda de streetwear.

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que el proyecto se inicialice (puede tomar unos minutos)

## 2. Configurar Variables de Entorno

Copia el archivo `.env.local` y completa las siguientes variables:

### Variables Requeridas

```env
# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave pública anónima (puedes encontrarla en Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Clave de servicio (Settings > API > service_role key)
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_aqui

# URL de conexión a PostgreSQL (Settings > Database > Connection string > URI)
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.tu-proyecto.supabase.co:5432/postgres

# URL de tu sitio (para redirecciones de auth)
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# JWT Secret (Settings > API > JWT Settings > JWT Secret)
SUPABASE_JWT_SECRET=tu_jwt_secret_aqui
```

### Dónde encontrar cada variable:

1. **NEXT_PUBLIC_SUPABASE_URL**: Settings > API > Project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Settings > API > Project API keys > anon public
3. **SUPABASE_SERVICE_ROLE_KEY**: Settings > API > Project API keys > service_role (¡Mantén esto secreto!)
4. **DATABASE_URL**: Settings > Database > Connection string > URI (reemplaza [YOUR-PASSWORD] con tu contraseña)
5. **SUPABASE_JWT_SECRET**: Settings > API > JWT Settings > JWT Secret

## 3. Ejecutar Migraciones

Una vez configuradas las variables de entorno, ejecuta las migraciones:

```bash
# Generar migraciones (si no están generadas)
npm run db:generate

# Aplicar migraciones a la base de datos
# NOTA: Si db:push falla con errores de DNS, usa migrate en su lugar
npm run db:push

# Alternativa si db:push no funciona:
npx drizzle-kit migrate

# Verificar que las tablas se crearon correctamente
npx drizzle-kit introspect
```

### Solución de Problemas de Conectividad

Si encuentras errores como `ENOTFOUND` o problemas de DNS:

1. **Usa `drizzle-kit migrate` en lugar de `db:push`**:
   ```bash
   npx drizzle-kit migrate
   ```

2. **Verifica la URL de la base de datos**:
   - Asegúrate de que la contraseña esté correcta (sin `[YOUR-PASSWORD]`)
   - Usa la URL directa: `postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres?sslmode=require`
   - Evita usar el pooler si tienes problemas de conectividad

3. **Verifica que el proyecto de Supabase esté activo**:
   - Ve al dashboard de Supabase
   - Asegúrate de que el proyecto no esté pausado

## 4. Configurar Autenticación

### Configurar Proveedores de OAuth

1. Ve a Authentication > Providers en tu dashboard de Supabase
2. Configura Google OAuth:
   - Habilita Google provider
   - Agrega tu Client ID y Client Secret de Google
   - Configura las URLs de redirección

### URLs de Redirección

Agrega estas URLs en Authentication > URL Configuration:

- **Site URL**: `http://localhost:3001` (desarrollo) / `https://tu-dominio.com` (producción)
- **Redirect URLs**: 
  - `http://localhost:3001/auth/callback` (desarrollo)
  - `https://tu-dominio.com/auth/callback` (producción)

## 5. Configurar RLS (Row Level Security)

Las tablas ya están configuradas con RLS en el schema. Puedes revisar y ajustar las políticas en:
Authentication > Policies

## 6. Verificar Instalación

Ejecuta el proyecto y verifica que:

```bash
npm run dev
```

1. La página de login funciona
2. El registro de usuarios funciona
3. La autenticación con Google funciona (si está configurada)
4. Las páginas protegidas redirigen correctamente

## 7. Comandos Útiles

```bash
# Generar nuevas migraciones después de cambios en schema
npm run db:generate

# Aplicar migraciones
npm run db:push

# Abrir Drizzle Studio para ver la base de datos
npm run db:studio
```

## Troubleshooting

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la contraseña no contenga caracteres especiales sin escapar

### Error de autenticación
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` sean correctas
- Revisa que las URLs de redirección estén configuradas en Supabase

### Error de CORS
- Verifica que `NEXT_PUBLIC_SITE_URL` coincida con la URL desde la que estás accediendo
- Revisa la configuración de Site URL en Supabase

## Próximos Pasos

Una vez configurado Supabase:

1. Puedes agregar datos de prueba usando Drizzle Studio
2. Configurar políticas de RLS más específicas según tus necesidades
3. Configurar webhooks para eventos de autenticación si es necesario
4. Configurar backups automáticos en producción