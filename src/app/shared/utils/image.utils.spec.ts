import { getFallbackImage, getSafeImageSrc, isImageTooLarge } from './image.utils';

describe('Image Utils', () => {
  describe('getSafeImageSrc', () => {
    it('should return default image when no image provided', () => {
      const result = getSafeImageSrc();
      expect(result).toBe('assets/img/logo2.webp');
    });

    it('should return HTTP URL directly', () => {
      const httpUrl = 'http://example.com/image.jpg';
      const result = getSafeImageSrc(httpUrl);
      expect(result).toBe(httpUrl);
    });

    it('should return HTTPS URL directly', () => {
      const httpsUrl = 'https://example.com/image.jpg';
      const result = getSafeImageSrc(httpsUrl);
      expect(result).toBe(httpsUrl);
    });

    it('should return small base64 image with data: prefix', () => {
      const base64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = getSafeImageSrc(base64);
      expect(result).toBe(`data:image/jpeg;base64,${base64}`);
    });

    it('should return base64 with data: prefix directly when already prefixed', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = getSafeImageSrc(dataUrl);
      expect(result).toBe(dataUrl);
    });

    it('should return data URL for large base64 in WebView environment', () => {
      // Simular entorno WebView
      (window as any).Capacitor = { platform: 'android' };

      const largeBase64 = 'a'.repeat(150000);
      const result = getSafeImageSrc(largeBase64);

      // En WebView, debe retornar data URL directamente
      expect(result).toBe(`data:image/jpeg;base64,${largeBase64}`);

      // Limpiar
      delete (window as any).Capacitor;
    });

    it('should return blob URL for large base64 in browser environment', () => {
      // Asegurar que NO estamos en WebView
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      const largeBase64 = 'a'.repeat(150000);
      const result = getSafeImageSrc(largeBase64);

      // En navegador, puede ser blob URL o fallback si falla la conversión
      expect(result.startsWith('blob:') || result.startsWith('assets/img/')).toBe(true);
    });

    it('should return fallback when blob URL is provided in WebView', () => {
      // Simular entorno WebView
      (window as any).Capacitor = { platform: 'ios' };

      const blobUrl = 'blob:http://localhost:4200/some-uuid';
      const result = getSafeImageSrc(blobUrl, 2);

      // En WebView, blob URLs no funcionan, debe usar fallback
      expect(result).toBe('assets/img/product-2.webp');

      // Limpiar
      delete (window as any).Capacitor;
    });
  });

  describe('isImageTooLarge', () => {
    it('should return false for undefined image', () => {
      const result = isImageTooLarge();
      expect(result).toBe(false);
    });

    it('should return false for small image', () => {
      const smallImage = 'a'.repeat(50000);
      const result = isImageTooLarge(smallImage);
      expect(result).toBe(false);
    });

    it('should return true for large image', () => {
      const largeImage = 'a'.repeat(150000);
      const result = isImageTooLarge(largeImage);
      expect(result).toBe(true);
    });
  });

  describe('getFallbackImage', () => {
    it('should return first fallback image when no id provided', () => {
      const result = getFallbackImage();
      expect(result).toBe('assets/img/product-1.webp');
    });

    it('should return mapped fallback image for valid id', () => {
      const result = getFallbackImage(2);
      expect(result).toBe('assets/img/product-2.webp');
    });

    it('should wrap around for large ids', () => {
      const result = getFallbackImage(7);
      expect(result).toBe('assets/img/product-1.webp');
    });

    it('should return first image for zero id', () => {
      const result = getFallbackImage(0);
      expect(result).toBe('assets/img/product-1.webp');
    });

    it('should return first image for negative id', () => {
      const result = getFallbackImage(-1);
      expect(result).toBe('assets/img/product-1.webp');
    });
  });
});
