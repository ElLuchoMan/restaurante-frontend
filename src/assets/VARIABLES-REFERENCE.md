# 📚 Referencia Rápida de Variables SCSS

## 🎨 Variables de Texto

- `$text-heading-strong`: `#212121` - Títulos (casi negro)
- `$text-body`: `#424242` - Texto de contenido (gris oscuro)
- `$text-muted`: `#9e9e9e` - Subtítulos/ayudas (gris claro)
- `$text-dark`: `#2c3e50` - Texto oscuro para contraste sobre fondos claros

## 🎨 Colores Principales

- `$primary`: `#ffc107` - Maíz dorado vibrante
- `$secondary`: `#6d4c41` - Café colombiano con leche
- `$secondary-hover`: `#75554a` - Café para hover
- `$tertiary`: `#ff5722` - Frutas tropicales (papaya)
- `$quaternary`: `#ffb300` - Hover del primary (más oscuro)

## 🚦 Colores de Estado

- `$success`: `#2e7d32` - Verde esmeralda
- `$info`: `#0288d1` - Azul fresco
- `$warning`: `#fbc02d` - Amarillo intenso
- `$danger`: `#c62828` - Rojo vibrante

## 🎨 Colores Base

- `$white`: `#fff`
- `$black`: `#000`
- `$light`: `#fafafa` - Fondo claro
- `$dark`: `#212121` - Fondo oscuro
- `$gray`: `#6c757d`
- `$gray-dark`: `#343a40`
- `$gray-light`: `#999`
- `$gray-lighter`: `#f8f9fa`

## 🎨 Colores Especiales

- `$border-subtle`: `#e0e0e0` - Bordes sutiles
- `$disabled-bg`: `#e0e0e0` - Fondo para elementos deshabilitados
- `$disabled-text`: `#9e9e9e` - Texto para elementos deshabilitados

## 🌈 Sombras

- `$shadow-soft`: `rgba(0, 0, 0, 0.08)` - Sombra base
- `$shadow-hover`: `rgba(0, 0, 0, 0.12)` - Sombra hover
- `$shadow-light`: `rgba(0, 0, 0, 0.04)` - Sombra muy sutil
- `$shadow-medium`: `rgba(0, 0, 0, 0.06)` - Sombra media
- `$shadow-overlay`: `rgba(0, 0, 0, 0.35)` - Overlay oscuro

## 🎨 Colores con Alpha (Primary)

- `$ring-primary-12`: `rgba($primary, 0.12)` - Focus ring dorado suave
- `$ring-primary-15`: `rgba($primary, 0.15)` - Variante más visible
- `$glow-primary-60`: `rgba($primary, 0.6)` - Borde brillante dorado
- `$shadow-primary-30`: `rgba($primary, 0.3)` - Sombra dorada sutil
- `$shadow-primary-40`: `rgba($primary, 0.4)` - Sombra dorada para efectos
- `$shadow-primary-50`: `rgba($primary, 0.5)` - Sombra dorada intensa

## 📐 Gradientes

- `$gradient-primary`: `linear-gradient(135deg, #{$primary}, #{$primary-dark})`
- `$gradient-primary-hover`: `linear-gradient(135deg, #{$primary-dark}, #{$primary-darker})`
- `$gradient-neutral`: `linear-gradient(135deg, #{$gray-lighter} 0%, #{$white} 100%)`
- `$gradient-dark-overlay`: `linear-gradient(135deg, rgba(44, 62, 80, 0.9) 0%, rgba(52, 73, 94, 0.9) 100%)`

## 📱 Breakpoints

- `$breakpoint-xs`: `0`
- `$breakpoint-sm`: `576px`
- `$breakpoint-md`: `768px`
- `$breakpoint-lg`: `992px` ⚠️ **WEB DESKTOP**
- `$breakpoint-xl`: `1200px`

## 🔤 Tipografía

- `$font-family-sans-serif`: `'Montserrat', 'Poppins', sans-serif`
- `$font-family-display`: `'Alegreya Sans', 'Poppins', sans-serif`
- `$headings-color`: `$text-heading-strong`

## ⚠️ IMPORTANTE

**NUNCA usar variables que no existen en `_variables.scss`**

❌ **NO USAR:**

- `$text-primary`
- `$text-secondary`
- `$color-text`
- `$primary-color`

✅ **USAR:**

- `$text-heading-strong` (para títulos)
- `$text-body` (para contenido)
- `$text-muted` (para texto secundario)
- `$primary` (para color primario)

---

📝 **Nota:** Siempre consultar `src/assets/_variables.scss` para la lista completa y actualizada de variables disponibles.
