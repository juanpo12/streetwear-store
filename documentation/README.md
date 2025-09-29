# 📚 Documentación - Streetwear Store

Bienvenido a la documentación del proyecto Streetwear Store. Aquí encontrarás toda la información necesaria para entender y trabajar con el proyecto.

## 📋 Índice de Documentación

### 🔌 [API Documentation](./API_DOCUMENTATION.md)
Documentación completa de las APIs implementadas:
- Endpoints disponibles (`/api/products`, `/api/products/search`)
- Estructura de datos y tipos
- Ejemplos de uso y integración
- Manejo de errores
- Guías de implementación frontend

## 🏗️ Arquitectura del Proyecto

### Frontend
- **Framework:** Next.js 14 con App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Estado:** React Context API
- **Componentes:** Componentes reutilizables y modulares

### Backend
- **API Routes:** Next.js API Routes
- **Datos:** Actualmente hardcodeados (preparado para base de datos)
- **Estructura:** RESTful API design

### Estructura de Carpetas

```
streetwear-store/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── shop/              # Página de tienda
│   └── admin/             # Panel de administración
├── components/            # Componentes React reutilizables
├── documentation/         # Documentación del proyecto
├── public/               # Archivos estáticos
└── styles/               # Estilos globales
```

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
# o
pnpm install
```

### Desarrollo
```bash
npm run dev
# o
pnpm dev
```

### Build
```bash
npm run build
# o
pnpm build
```

## 🔧 Configuración

### Variables de Entorno
Actualmente no se requieren variables de entorno, pero para futuras integraciones:

```env
# Base de datos
DATABASE_URL=your_database_url

# Autenticación
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Pagos (futuro)
STRIPE_SECRET_KEY=your_stripe_key
```

## 📦 Dependencias Principales

- **Next.js** - Framework React
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos
- **TypeScript** - Tipado estático

## 🎨 Guía de Estilo

### Colores
- **Primary:** Sistema de colores personalizado para streetwear
- **Background:** Tonos neutros con soporte para modo oscuro
- **Accent:** Colores de acento para CTAs y elementos importantes

### Tipografía
- **Headings:** Fuentes bold y modernas para títulos
- **Body:** Fuentes legibles para contenido
- **Streetwear:** Clases personalizadas para el estilo streetwear

## 🔄 Estados de la Aplicación

### Gestión de Estado
- **Cart:** Context API para carrito de compras
- **Search:** Context API para búsqueda
- **Theme:** Context API para tema (claro/oscuro)

### Estados de Loading
- Skeleton loaders para mejor UX
- Estados de error con opciones de retry
- Indicadores de carga apropiados

## 🧪 Testing (Futuro)

### Estructura de Tests
```
__tests__/
├── components/           # Tests de componentes
├── api/                 # Tests de API
└── utils/               # Tests de utilidades
```

### Herramientas Recomendadas
- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes
- **Cypress** - Tests E2E

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Otras Plataformas
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 🔮 Roadmap

### Próximas Características
- [ ] Integración con base de datos real
- [ ] Sistema de autenticación
- [ ] Procesamiento de pagos
- [ ] Panel de administración completo
- [ ] Sistema de reviews
- [ ] Wishlist de productos
- [ ] Notificaciones push
- [ ] PWA support

### Mejoras Técnicas
- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Optimización de imágenes
- [ ] SEO mejorado
- [ ] Analytics integration

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

### Estándares de Código
- Usar TypeScript para tipado
- Seguir convenciones de naming
- Documentar funciones complejas
- Mantener componentes pequeños y reutilizables

## 📞 Soporte

Para preguntas o problemas:
- Crear un issue en GitHub
- Revisar la documentación existente
- Consultar los ejemplos de código

---

**Última actualización:** Diciembre 2024  
**Versión del Proyecto:** 1.0.0