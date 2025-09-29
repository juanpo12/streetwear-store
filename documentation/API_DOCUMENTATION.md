# API Documentation - Streetwear Store

Esta documentación describe cómo usar las APIs implementadas en la tienda de streetwear.

## 📋 Tabla de Contenidos

- [Endpoints Disponibles](#endpoints-disponibles)
- [Estructura de Datos](#estructura-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Manejo de Errores](#manejo-de-errores)
- [Integración Frontend](#integración-frontend)

## 🚀 Endpoints Disponibles

### 1. Obtener Todos los Productos

**Endpoint:** `GET /api/products`

**Descripción:** Obtiene una lista de todos los productos disponibles con opciones de filtrado.

**Parámetros de Query:**
- `category` (opcional): Filtrar por categoría específica
- `featured` (opcional): `true` para obtener solo productos destacados
- `limit` (opcional): Número máximo de productos a retornar

**Ejemplo de Request:**
```
GET /api/products?featured=true&limit=4
GET /api/products?category=HOODIES
GET /api/products
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "OVERSIZED HOODIE",
      "price": 89,
      "image": "/oversized-black-hoodie-streetwear.png",
      "category": "HOODIES",
      "description": "Comfortable oversized hoodie perfect for street style",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Black", "White", "Gray"],
      "inStock": true,
      "featured": true
    }
  ],
  "total": 1
}
```

### 2. Buscar Productos

**Endpoint:** `GET /api/products/search`

**Descripción:** Busca productos por nombre, descripción o categoría.

**Parámetros de Query:**
- `q` (requerido): Término de búsqueda
- `category` (opcional): Filtrar por categoría específica
- `limit` (opcional): Número máximo de resultados

**Ejemplo de Request:**
```
GET /api/products/search?q=hoodie
GET /api/products/search?q=black&category=HOODIES&limit=5
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "OVERSIZED HOODIE",
      "price": 89,
      "image": "/oversized-black-hoodie-streetwear.png",
      "category": "HOODIES",
      "description": "Comfortable oversized hoodie perfect for street style",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Black", "White", "Gray"],
      "inStock": true,
      "featured": true
    }
  ],
  "total": 1,
  "query": "hoodie"
}
```

## 📊 Estructura de Datos

### Producto (Product)

```typescript
interface Product {
  id: number;              // ID único del producto
  name: string;            // Nombre del producto
  price: number;           // Precio en USD
  image: string;           // URL de la imagen principal
  category: string;        // Categoría del producto
  description: string;     // Descripción detallada
  sizes: string[];         // Tallas disponibles
  colors: string[];        // Colores disponibles
  inStock: boolean;        // Disponibilidad en stock
  featured: boolean;       // Si es producto destacado
}
```

### Categorías Disponibles

- `HOODIES` - Sudaderas con capucha
- `TEES` - Camisetas
- `BOTTOMS` - Pantalones y shorts
- `JACKETS` - Chaquetas y abrigos
- `ACCESSORIES` - Accesorios

## 💡 Ejemplos de Uso

### Obtener Productos Destacados para la Homepage

```javascript
const fetchFeaturedProducts = async () => {
  try {
    const response = await fetch('/api/products?featured=true&limit=4');
    const data = await response.json();
    
    if (data.success) {
      setFeaturedProducts(data.products);
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
  }
};
```

### Implementar Búsqueda en Tiempo Real

```javascript
const searchProducts = async (query) => {
  if (!query.trim()) return;
  
  try {
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.success) {
      setSearchResults(data.data);
    }
  } catch (error) {
    console.error('Error searching products:', error);
  }
};
```

### Filtrar Productos por Categoría

```javascript
const fetchProductsByCategory = async (category) => {
  try {
    const url = category === 'ALL' 
      ? '/api/products' 
      : `/api/products?category=${category}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      setProducts(data.products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};
```

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

- `200` - Éxito
- `400` - Solicitud incorrecta (parámetros inválidos)
- `404` - No encontrado
- `500` - Error interno del servidor

### Estructura de Error

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo",
  "code": "ERROR_CODE"
}
```

### Ejemplo de Manejo de Errores

```javascript
const fetchProducts = async () => {
  try {
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred');
    }
    
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Manejar el error apropiadamente en la UI
    setError(error.message);
    return [];
  }
};
```

## 🔧 Integración Frontend

### Componentes que Usan la API

1. **FeaturedProducts** - Usa `/api/products?featured=true&limit=4`
2. **SearchModal** - Usa `/api/products/search` y `/api/products?limit=8`
3. **ShopPage** - Usa `/api/products` con filtros de categoría

### Estados de Loading Recomendados

```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [products, setProducts] = useState([]);

// Implementar skeleton loading mientras se cargan los datos
if (loading) {
  return <SkeletonLoader />;
}

// Mostrar mensaje de error si algo falla
if (error) {
  return <ErrorMessage error={error} onRetry={fetchProducts} />;
}
```

## 🚀 Próximos Pasos

Esta implementación actual usa datos hardcodeados. Para migrar a una base de datos real:

1. **Reemplazar los datos mock** en los archivos de API
2. **Conectar a base de datos** (Supabase, PostgreSQL, etc.)
3. **Implementar autenticación** para operaciones CRUD
4. **Agregar paginación** para grandes conjuntos de datos
5. **Implementar cache** para mejorar performance

## 📝 Notas Importantes

- Todos los precios están en USD
- Las imágenes deben estar en la carpeta `/public`
- Los endpoints son case-sensitive
- Usar `encodeURIComponent()` para queries de búsqueda
- Implementar debouncing para búsquedas en tiempo real

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0