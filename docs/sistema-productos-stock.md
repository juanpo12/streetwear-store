# Sistema de productos, variantes e inventario

Este documento describe cómo funciona el sistema de productos, su relación con variantes (talle/color), el manejo de imágenes y el cálculo de stock tanto en el backend como en el frontend.

## Conceptos clave

- Producto: entidad principal con nombre, descripciones, precio, categoría, imágenes y metadatos.
- Variante: combinación de atributos que determina inventario de un producto. En este proyecto la variante es "TALLE / COLOR" y su título se compone así: `"<TALLE> / <COLOR>"`.
- Inventario: se guarda por variante en `inventoryQuantity` y se calcula en el producto como la suma de inventarios de sus variantes.
- Colores opcionales: el sistema soporta productos sin colores (modo "Único modelo"), donde sólo hay inventario por talle.

## Flujo general

1. Creación/edición: el admin define si el producto es "Único modelo (sin colores)" o si tiene colores. Luego carga el stock por talle (único modelo) o por talle y color (grid).
2. Persistencia: el backend crea/actualiza variantes en base al payload recibido. Cada variante recibe `inventoryQuantity` y un `title` formado por `"<TALLE> / <COLOR>"` (en modo único, el color es "Color Único").
3. Lectura: los endpoints GET devuelven el producto con sus variantes y calculan:
   - `sizes` y `colors` normalizados desde `variant.title` (ignorando SKU).
   - `inStock` a partir de la suma de `inventoryQuantity` de todas las variantes (si no hay variantes, usa `product.stock`).
4. Frontend: la ficha de producto muestra disponibilidad en función de `inventoryQuantity` agregado; la etiqueta "Agotado" sólo aparece cuando no hay unidades en ninguna variante.

## Backend

### Endpoints relevantes

- `GET /api/products`: lista de productos. Para cada producto:
  - Extrae `sizes` y `colors` desde `variant.title` con normalización case-insensitive (se evita duplicación y se respeta el casing original).
  - Calcula `inStock` sumando `inventoryQuantity` de variantes; si no existen variantes, usa `stock` del producto.
- `GET /api/products/[id]`: detalle de producto. Devuelve `variants` y los mismos campos derivados (`sizes`, `colors`, `inStock`).
- `PUT /api/products/[id]`: actualización de producto. El payload soporta los siguientes campos relevantes para variantes:
  - `colors: string[]` — si está vacío, se considera "Único modelo".
  - `sizeStocks: Record<string, number>` — inventario por talle (solo se usa cuando `colors` está vacío).
  - `sizeColorStocks: Record<string, Record<string, number>>` — inventario por talle y color (se usa cuando hay colores).
  - Además de `name`, `description`, `price`, `images`, `categoryId`, etc.

### Lógica de variantes en PUT

- Único modelo (sin colores):
  - Se genera una variante por cada talle `['S','M','L','XL','XXL']`.
  - El título de la variante es `"<TALLE> / Color Único"`.
  - `inventoryQuantity` proviene de `sizeStocks[talle]`.
- Con colores:
  - Por cada `color` y cada talle de `['S','M','L','XL','XXL']` se genera una variante.
  - El título de la variante es `"<TALLE> / <COLOR>"`.
  - `inventoryQuantity` proviene de `sizeColorStocks[color][talle]`.

> Nota: los talles por defecto son `S, M, L, XL, XXL`. Si el payload no incluye talles, el backend usa estos.

### Cálculo de `inStock`

- Se suma `inventoryQuantity` de todas las variantes del producto.
- Si no hay variantes, se usa el campo `stock` del producto.
- Si el total es `> 0`, `inStock = true`. De lo contrario, `false`.

## Frontend

### Admin: formulario de edición (`/admin/products/[id]/edit`)

- Toggle: "Único modelo (sin colores)".
- Si está activado:
  - Se oculta el selector de colores.
  - Se muestra "Stock por talle" con inputs para `S, M, L, XL, XXL`.
  - El submit envía `sizeStocks` y `colors: []`.
- Si está desactivado:
  - Se muestra el selector de colores.
  - Se muestra "Stock por talle y color" (grid de talles por cada color).
  - El submit envía `sizeColorStocks` y `colors`.
- El selector de talles antiguo se elimina; el sistema usa talles por defecto y la grilla/inputs cubre el stock necesario.

### Ficha de producto

- El badge de disponibilidad usa la suma de `inventoryQuantity` de todas las variantes (y cae a `product.stock` si no hay variantes).
- Desaparece la duplicación de talles/colores: se extraen desde `variant.title` con normalización case-insensitive.

## Ejemplos de payload

### Único modelo (sin colores)

```json
{
  "name": "Camiseta Básica",
  "colors": [],
  "sizeStocks": {
    "S": 10,
    "M": 20,
    "L": 15,
    "XL": 8,
    "XXL": 5
  },
  "images": ["https://.../img1.jpg"]
}
```

Resultado: variantes `S / Color Único`, `M / Color Único`, etc.

### Con colores

```json
{
  "name": "Hoodie Oversized",
  "colors": ["Negro", "Blanco"],
  "sizeColorStocks": {
    "Negro": { "S": 5, "M": 8, "L": 6, "XL": 2, "XXL": 1 },
    "Blanco": { "S": 3, "M": 7, "L": 4, "XL": 0, "XXL": 0 }
  },
  "images": ["https://.../hoodie.jpg"]
}
```

Resultado: variantes `S / Negro`, `M / Negro`, ..., `S / Blanco`, etc.

## Recomendaciones de uso

- Usar nombres de colores consistentes (e.g., "Negro", "Blanco", "Rojo").
- Evitar duplicaciones: el sistema ya normaliza, pero es preferible mantener casing coherente.
- Para migraciones desde el formulario viejo, activar el toggle según necesite y completar stocks.
- Si un producto no tiene variantes creadas, el campo `stock` del producto actúa como fallback (se recomienda usar siempre variantes).

## Comportamiento de "Agotado"

- Se muestra "Agotado" sólo cuando la suma de inventarios de variantes es `0`.
- Si al menos una variante tiene stock, se muestra como disponible.

## Resumen

- Todo el inventario se maneja desde variantes con título `"<TALLE> / <COLOR>"`.
- El modo "Único modelo" simplifica a inventario por talle sin colores.
- La UI de edición nueva envía `sizeStocks` o `sizeColorStocks` según corresponda, y el backend crea/actualiza variantes consistentemente.