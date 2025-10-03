/**
 * Utilidades para el manejo seguro de imágenes base64 grandes
 */

/**
 * Tamaño máximo permitido para imágenes base64 como src directo (aproximadamente 50KB)
 * Imágenes más grandes se convierten a Blob URLs para mejor rendimiento
 */
const MAX_DIRECT_BASE64_SIZE = 50000;

/**
 * Cache de Blob URLs para evitar recrear las mismas imágenes
 */
const blobUrlCache = new Map<string, string>();

/**
 * Imágenes estáticas de fallback disponibles en la aplicación
 */
const FALLBACK_IMAGES = [
  'assets/img/product-1.webp',
  'assets/img/product-2.webp',
  'assets/img/product-3.webp',
  'assets/img/product-4.webp',
  'assets/img/portfolio-1.webp',
  'assets/img/portfolio-2.webp',
];

/**
 * Imagen por defecto cuando no hay imagen disponible
 */
const DEFAULT_IMAGE = 'assets/img/logo2.webp';

/**
 * Convierte una imagen base64 a Blob URL para mejor rendimiento
 * @param base64Data Datos base64 de la imagen (con o sin prefijo data:)
 * @returns Blob URL o null si hay error
 */
function createBlobUrl(base64Data: string): string | null {
  try {
    // Verificar si ya está en cache
    if (blobUrlCache.has(base64Data)) {
      return blobUrlCache.get(base64Data)!;
    }

    // Remover prefijo data: si existe
    const cleanBase64 = base64Data.replace(/^data:image\/[^;]+;base64,/, '');

    // Convertir base64 a binary
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Crear blob
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const blobUrl = URL.createObjectURL(blob);

    // Guardar en cache
    blobUrlCache.set(base64Data, blobUrl);

    return blobUrl;
  } catch (error) {
    console.error('❌ Error creando Blob URL:', error);
    return null;
  }
}

/**
 * Detecta si estamos en un entorno WebView (Capacitor/Cordova)
 */
function isWebView(): boolean {
  return !!(
    (window as any).Capacitor ||
    (window as any).cordova ||
    document.URL.startsWith('capacitor://') ||
    document.URL.startsWith('ionic://') ||
    document.URL.startsWith('file://')
  );
}

/**
 * Obtiene una fuente de imagen segura que evita el error 431
 * @param base64Image Imagen en formato base64
 * @param productId ID del producto para mapear a imagen estática (opcional)
 * @returns URL segura para usar en src
 */
export function getSafeImageSrc(base64Image?: string, productId?: number): string {
  // Si no hay imagen, retornar imagen por defecto
  if (!base64Image) {
    return DEFAULT_IMAGE;
  }

  // Si es una URL HTTP, usar directamente
  if (base64Image.startsWith('http')) {
    return base64Image;
  }

  // ⚠️ En WebView, NO usar Blob URLs (no funcionan en Capacitor)
  // Usar data URLs directamente independientemente del tamaño
  const inWebView = isWebView();

  // Si ya es blob URL pero estamos en WebView, no podemos usarla
  if (base64Image.startsWith('blob:')) {
    if (inWebView) {
      // En WebView, si recibimos blob URL, usar fallback
      console.warn('⚠️ Blob URL recibida en WebView, usando fallback');
      const fallbackIndex =
        productId && productId > 0 ? (productId - 1) % FALLBACK_IMAGES.length : 0;
      return FALLBACK_IMAGES[fallbackIndex] || DEFAULT_IMAGE;
    }
    return base64Image;
  }

  // Si es base64 grande y NO estamos en WebView, convertir a Blob URL
  if (base64Image.length > MAX_DIRECT_BASE64_SIZE && !inWebView) {
    const blobUrl = createBlobUrl(base64Image);
    if (blobUrl) {
      return blobUrl;
    }

    // Si falla la conversión, usar fallback
    const fallbackIndex = productId && productId > 0 ? (productId - 1) % FALLBACK_IMAGES.length : 0;
    const fallbackImage = FALLBACK_IMAGES[fallbackIndex] || FALLBACK_IMAGES[0];
    return fallbackImage;
  }

  // Si es base64 pequeño O estamos en WebView, agregar prefijo data: si es necesario
  if (base64Image.startsWith('data:')) {
    return base64Image;
  }

  // Agregar prefijo data: a cadena base64 sin prefijo
  return `data:image/jpeg;base64,${base64Image}`;
}

/**
 * Verifica si una imagen base64 es demasiado grande para usarse directamente
 * @param base64Image Imagen en formato base64
 * @returns true si la imagen es demasiado grande
 */
export function isImageTooLarge(base64Image?: string): boolean {
  return !!(base64Image && base64Image.length > MAX_DIRECT_BASE64_SIZE);
}

/**
 * Obtiene una imagen estática de fallback basada en un ID
 * @param id ID para mapear a imagen estática
 * @returns URL de imagen estática
 */
export function getFallbackImage(id?: number): string {
  if (id && id > 0) {
    return FALLBACK_IMAGES[(id - 1) % FALLBACK_IMAGES.length] || FALLBACK_IMAGES[0];
  }
  return FALLBACK_IMAGES[0];
}

/**
 * Limpia el cache de Blob URLs para liberar memoria
 * Útil para evitar memory leaks cuando se cambian productos
 */
export function clearBlobUrlCache(): void {
  for (const blobUrl of blobUrlCache.values()) {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('⚠️ Error revocando Blob URL:', error);
    }
  }
  blobUrlCache.clear();
}
