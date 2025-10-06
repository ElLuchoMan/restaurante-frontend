import {
  createURLMockSuccess,
  createURLMockWithError,
  createURLMockWithRevokeError,
} from '../mocks/test-doubles';
import {
  clearBlobUrlCache,
  getFallbackImage,
  getSafeImageSrc,
  isImageTooLarge,
} from './image.utils';

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

  describe('clearBlobUrlCache', () => {
    beforeEach(() => {
      // Limpiar cache antes de cada test
      clearBlobUrlCache();
    });

    it('should clear the blob URL cache', () => {
      // Mock URL.createObjectURL y URL.revokeObjectURL
      const mockBlobUrl = 'blob:mock-url-123';
      const urlMock = createURLMockSuccess(mockBlobUrl);

      global.URL.createObjectURL = urlMock.createObjectURL;
      global.URL.revokeObjectURL = urlMock.revokeObjectURL;

      // Asegurar que NO estamos en WebView
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      // Crear una imagen grande que usará blob URL
      const largeBase64 = 'a'.repeat(150000);

      // Primera llamada - debe crear blob URL
      const result1 = getSafeImageSrc(largeBase64);

      // Segunda llamada con la misma imagen - debe usar cache
      const result2 = getSafeImageSrc(largeBase64);

      // Ambas deben retornar el mismo blob URL
      expect(result1).toBe(mockBlobUrl);
      expect(result2).toBe(mockBlobUrl);

      // createObjectURL debe haber sido llamado solo una vez (cache)
      expect(urlMock.createObjectURL).toHaveBeenCalledTimes(1);

      // Limpiar cache
      clearBlobUrlCache();

      // revokeObjectURL debe haber sido llamado
      expect(urlMock.revokeObjectURL).toHaveBeenCalledWith(mockBlobUrl);
    });

    it('should handle errors when revoking blob URLs', () => {
      const urlMock = createURLMockWithRevokeError();

      global.URL.createObjectURL = urlMock.createObjectURL;
      global.URL.revokeObjectURL = urlMock.revokeObjectURL;

      // Asegurar que NO estamos en WebView
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      // Crear una imagen grande
      const largeBase64 = 'b'.repeat(150000);
      getSafeImageSrc(largeBase64);

      // Limpiar cache - no debe lanzar error aunque revoke falle
      expect(() => clearBlobUrlCache()).not.toThrow();

      expect(urlMock.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should return blob URL when browser environment in WebView check', () => {
      // Simular blob URL ya existente en navegador
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      const blobUrl = 'blob:http://localhost:4200/some-uuid';
      const result = getSafeImageSrc(blobUrl);

      // En navegador, debe retornar el blob URL directamente
      expect(result).toBe(blobUrl);
    });

    it('should return fallback when blob conversion fails and productId is null', () => {
      // Mock URL.createObjectURL para que lance error
      const urlMock = createURLMockWithError();
      global.URL.createObjectURL = urlMock.createObjectURL;

      // Asegurar que NO estamos en WebView
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      const largeBase64 = 'c'.repeat(150000);
      const result = getSafeImageSrc(largeBase64);

      // Debe retornar una imagen de fallback cuando falla la conversión
      expect(result.startsWith('assets/img/')).toBe(true);
    });

    it('should use cache when same base64 is requested twice', () => {
      const mockBlobUrl = 'blob:cached-url';
      const urlMock = createURLMockSuccess(mockBlobUrl);

      global.URL.createObjectURL = urlMock.createObjectURL;

      // Asegurar que NO estamos en WebView
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      const largeBase64 = 'd'.repeat(150000);

      // Primera llamada
      const result1 = getSafeImageSrc(largeBase64);
      expect(result1).toBe(mockBlobUrl);

      // Segunda llamada - debe usar cache
      const result2 = getSafeImageSrc(largeBase64);
      expect(result2).toBe(mockBlobUrl);

      // createObjectURL solo debe ser llamado una vez
      expect(urlMock.createObjectURL).toHaveBeenCalledTimes(1);

      // Limpiar
      clearBlobUrlCache();
    });

    it('should handle blob URL with productId when failing', () => {
      // Mock URL.createObjectURL para que lance error
      const urlMock = createURLMockWithError();
      global.URL.createObjectURL = urlMock.createObjectURL;

      // Asegurar que NO estamos en WebView
      delete (window as any).Capacitor;
      delete (window as any).cordova;

      const largeBase64 = 'e'.repeat(150000);
      const result = getSafeImageSrc(largeBase64, 3);

      // Debe retornar la tercera imagen de fallback
      expect(result).toBe('assets/img/product-3.webp');
    });

    it('should return blob URL without productId in WebView fallback check', () => {
      // Simular WebView
      (window as any).Capacitor = { platform: 'android' };

      const blobUrl = 'blob:http://localhost:4200/uuid';
      const result = getSafeImageSrc(blobUrl);

      // Sin productId, debe retornar el primer fallback
      expect(result).toBe('assets/img/product-1.webp');

      // Limpiar
      delete (window as any).Capacitor;
    });
  });
});
