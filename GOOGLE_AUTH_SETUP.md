# Configuración de Autenticación con Google en Supabase

## Problema Actual
El error `"Unsupported provider: provider is not enabled"` indica que el proveedor de Google no está habilitado en tu proyecto de Supabase.

## Pasos para Configurar Google OAuth

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** y **Google Identity API**
4. Ve a **APIs & Services > Credentials**
5. Haz clic en **Create Credentials > OAuth 2.0 Client IDs**
6. Configura la pantalla de consentimiento OAuth si es necesario
7. Selecciona **Web application** como tipo de aplicación
8. Configura las URIs autorizadas:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**:
     - `https://pwgigvfkefcovjthxakc.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo)

### 2. Configurar Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication > Providers**
4. Busca **Google** en la lista de proveedores
5. Habilita el toggle de Google
6. Ingresa las credenciales de Google:
   - **Client ID**: El Client ID de Google Cloud Console
   - **Client Secret**: El Client Secret de Google Cloud Console
7. Configura la URL de redirección:
   - **Redirect URL**: `https://pwgigvfkefcovjthxakc.supabase.co/auth/v1/callback`
8. Guarda los cambios

### 3. Variables de Entorno (Opcional)

Si quieres usar las credenciales en tu aplicación, agrega a tu `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
```

### 4. Configuración de Desarrollo vs Producción

#### Desarrollo (localhost:3000)
- Asegúrate de que `http://localhost:3000` esté en las JavaScript origins
- Usa `http://localhost:3000/auth/callback` como redirect URI

#### Producción
- Agrega tu dominio de producción a las JavaScript origins
- Usa `https://tu-dominio.com/auth/callback` como redirect URI

### 5. Verificar la Configuración

1. Ve a **Authentication > Settings** en Supabase
2. Verifica que la **Site URL** esté configurada correctamente:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`
3. Verifica que las **Redirect URLs** incluyan:
   - `http://localhost:3000/auth/callback`
   - `https://tu-dominio.com/auth/callback` (para producción)

## Solución de Problemas

### Error: "Unsupported provider"
- Verifica que Google esté habilitado en Supabase Authentication > Providers
- Asegúrate de haber guardado la configuración

### Error: "Invalid redirect URI"
- Verifica que las URIs de redirección coincidan exactamente
- No olvides incluir `https://` o `http://`
- Asegúrate de que no haya espacios extra

### Error: "Invalid client"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que las credenciales sean del mismo proyecto de Google Cloud

## Código de Implementación

El código actual en `app/auth/login/page.tsx` y `app/auth/register/page.tsx` ya está correctamente implementado para usar Google OAuth. Una vez que configures Supabase, debería funcionar automáticamente.

```typescript
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) {
    setError(error.message)
  }
}
```

## Callback Handler

Asegúrate de que el archivo `app/auth/callback/route.ts` esté configurado correctamente para manejar la respuesta de Google.