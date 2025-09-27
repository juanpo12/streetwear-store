# Sistema de Colores - Urban Threads Streetwear

Este documento explica el sistema de colores de tu tienda streetwear y cómo modificar cada uno.

## Paleta de Colores Principal

### 🎨 Colores Base
- **Background**: `oklch(0.98 0.005 85)` - Blanco cálido off-white
- **Foreground**: `oklch(0.15 0.01 85)` - Carbón profundo para texto
- **Primary**: `oklch(0.15 0.01 85)` - Carbón profundo para elementos principales
- **Accent**: `oklch(0.65 0.15 25)` - Naranja bold para acentos

### 🌙 Modo Oscuro
- **Background**: `oklch(0.08 0.01 85)` - Carbón muy oscuro
- **Foreground**: `oklch(0.95 0.005 85)` - Blanco off-white
- **Primary**: `oklch(0.95 0.005 85)` - Blanco para elementos principales
- **Accent**: `oklch(0.75 0.18 25)` - Naranja más brillante para modo oscuro

## Cómo Cambiar los Colores

### 📍 Ubicación del Archivo
Los colores se definen en: `app/globals.css`

### 🔧 Modificar Colores

#### 1. Cambiar el Color Principal (Primary)
\`\`\`css
:root {
  --primary: oklch(0.15 0.01 85); /* Cambia estos valores */
}

.dark {
  --primary: oklch(0.95 0.005 85); /* Y estos para modo oscuro */
}
\`\`\`

#### 2. Cambiar el Color de Acento (Accent)
\`\`\`css
:root {
  --accent: oklch(0.65 0.15 25); /* Naranja actual */
}

.dark {
  --accent: oklch(0.75 0.18 25); /* Naranja modo oscuro */
}
\`\`\`

#### 3. Cambiar Colores de Fondo
\`\`\`css
:root {
  --background: oklch(0.98 0.005 85); /* Fondo principal */
  --card: oklch(0.98 0.005 85); /* Fondo de tarjetas */
}
\`\`\`

## 🎯 Colores Sugeridos para Streetwear

### Paletas Alternativas

#### Paleta Monocromática (Negro/Blanco)
\`\`\`css
--primary: oklch(0.1 0 0);        /* Negro puro */
--accent: oklch(0.9 0 0);         /* Blanco puro */
--background: oklch(0.95 0 0);    /* Gris muy claro */
\`\`\`

#### Paleta Urbana (Grises + Verde)
\`\`\`css
--primary: oklch(0.2 0.02 120);   /* Gris verdoso */
--accent: oklch(0.6 0.15 140);    /* Verde militar */
--background: oklch(0.96 0.01 120); /* Gris cálido */
\`\`\`

#### Paleta Bold (Negro + Rojo)
\`\`\`css
--primary: oklch(0.1 0 0);        /* Negro */
--accent: oklch(0.55 0.22 15);    /* Rojo intenso */
--background: oklch(0.98 0.005 15); /* Blanco cálido */
\`\`\`

#### Paleta Minimalista (Beige + Marrón)
\`\`\`css
--primary: oklch(0.25 0.03 60);   /* Marrón oscuro */
--accent: oklch(0.45 0.08 45);    /* Marrón medio */
--background: oklch(0.94 0.02 75); /* Beige claro */
\`\`\`

## 📝 Entendiendo OKLCH

OKLCH es un formato de color moderno que usa:
- **L** (Lightness): 0-1 (0=negro, 1=blanco)
- **C** (Chroma): 0-0.4 (intensidad del color)
- **H** (Hue): 0-360 (tono del color)

### Ejemplos de Tonos (H):
- 0-30: Rojos
- 30-90: Naranjas/Amarillos
- 90-150: Verdes
- 150-270: Azules/Cianes
- 270-330: Púrpuras/Magentas
- 330-360: Rojos

## 🚀 Aplicar Cambios

1. Abre `app/globals.css`
2. Modifica los valores en `:root` y `.dark`
3. Guarda el archivo
4. Los cambios se aplicarán automáticamente

## 💡 Tips para Streetwear

- **Mantén alto contraste** para legibilidad
- **Usa máximo 3-4 colores** para mantener la estética limpia
- **El naranja/rojo** funciona bien para calls-to-action
- **Grises neutros** son perfectos para backgrounds
- **Negro profundo** siempre funciona para streetwear

## 🎨 Clases CSS Personalizadas

También puedes usar estas clases personalizadas en tus componentes:

\`\`\`css
.text-streetwear-xl  /* Texto extra grande, bold, uppercase */
.text-streetwear-lg  /* Texto grande, bold, uppercase */
.text-streetwear-md  /* Texto mediano, semibold, uppercase */
\`\`\`

¡Experimenta con diferentes combinaciones para encontrar la estética perfecta para tu marca streetwear!
