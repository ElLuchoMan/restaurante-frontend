import { HttpRequest } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppConfigService } from '../services/app-config.service';
import { apiBaseInterceptor } from './api-base.interceptor';

describe('apiBaseInterceptor', () => {
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockNext: ReturnType<typeof import('../../shared/mocks/test-doubles').createNextHandlerMock>;

  beforeEach(() => {
    mockAppConfigService = {
      apiBase: 'http://localhost:8080/restaurante/v1',
    } as jest.Mocked<AppConfigService>;

    const { createNextHandlerMock } = require('../../shared/mocks/test-doubles');
    mockNext = createNextHandlerMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SSR/Server Platform', () => {
    beforeEach(() => {
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    });

    it('should skip URL rewriting in SSR and return original request', () => {
      // Arrange
      const request = new HttpRequest('GET', '/restaurante/v1/productos');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(request);
      expect(consoleSpy).toHaveBeenCalledWith('api-base: SSR request url type', 'string');

      consoleSpy.mockRestore();
    });

    it('should handle malformed request URL in SSR gracefully', () => {
      // Arrange
      const malformedRequest = {
        url: undefined,
      } as unknown as HttpRequest<unknown>;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = TestBed.runInInjectionContext(() =>
        apiBaseInterceptor(malformedRequest, mockNext),
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(malformedRequest);
      expect(result).toBe(malformedRequest);
      expect(consoleSpy).toHaveBeenCalledWith('api-base: SSR request url type', 'undefined');

      consoleSpy.mockRestore();
    });
  });

  describe('Browser Platform - URL Rewriting', () => {
    it('should rewrite absolute URL with API segment', () => {
      // Arrange
      const originalUrl = 'http://localhost:4200/restaurante/v1/productos';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1/productos';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should rewrite relative URL starting with API segment', () => {
      // Arrange
      const originalUrl = '/restaurante/v1/productos';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1/productos';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should handle URL with query parameters', () => {
      // Arrange
      const originalUrl = '/restaurante/v1/productos?page=1&limit=10';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1/productos?page=1&limit=10';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should handle URL with path parameters', () => {
      // Arrange
      const originalUrl = '/restaurante/v1/productos/123';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1/productos/123';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should not modify URLs that do not contain API segment', () => {
      // Arrange
      const originalUrl = '/assets/images/logo.png';
      const request = new HttpRequest('GET', originalUrl);

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(request);
    });

    it('should not modify external URLs without API segment', () => {
      // Arrange
      const originalUrl = 'https://api.external.com/data';
      const request = new HttpRequest('GET', originalUrl);

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(request);
    });

    it('should handle absolute URL with different host containing API segment', () => {
      // Arrange
      const originalUrl = 'https://other-host.com/restaurante/v1/productos';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1/productos';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });
  });

  describe('Configuration Handling', () => {
    it('should use default API segment when config is null', () => {
      // Arrange
      mockAppConfigService.apiBase = null as any;
      const originalUrl = '/restaurante/v1/productos';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = '/restaurante/v1/productos'; // Should use default segment

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should normalize base URL by removing trailing slashes', () => {
      // Arrange
      mockAppConfigService.apiBase = 'http://localhost:8080/restaurante/v1///';
      const originalUrl = '/restaurante/v1/productos';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1/productos';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should handle empty config base', () => {
      // Arrange
      mockAppConfigService.apiBase = '';
      const originalUrl = '/restaurante/v1/productos';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = '/restaurante/v1/productos'; // Empty string fallback to default segment

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed request URL gracefully', () => {
      // Arrange
      const malformedRequest = {
        url: { invalid: 'object' },
      } as unknown as HttpRequest<unknown>;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = TestBed.runInInjectionContext(() =>
        apiBaseInterceptor(malformedRequest, mockNext),
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(malformedRequest);
      expect(result).toBe(malformedRequest);
      // En navegador con url no-string, el interceptor convierte a string y no advierte
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle request with undefined URL', () => {
      // Arrange
      const requestWithUndefinedUrl = {
        url: undefined,
      } as unknown as HttpRequest<unknown>;

      // Act
      const result = TestBed.runInInjectionContext(() =>
        apiBaseInterceptor(requestWithUndefinedUrl, mockNext),
      );

      // Assert
      // Con url undefined, el interceptor pasa el request tal cual
      expect(mockNext).toHaveBeenCalledWith(requestWithUndefinedUrl);
    });

    it('should handle request with null URL', () => {
      // Arrange
      const requestWithNullUrl = {
        url: null,
      } as unknown as HttpRequest<unknown>;

      // Act
      const result = TestBed.runInInjectionContext(() =>
        apiBaseInterceptor(requestWithNullUrl, mockNext),
      );

      // Assert
      // Con url null, el interceptor pasa el request tal cual
      expect(mockNext).toHaveBeenCalledWith(requestWithNullUrl);
    });

    it('should handle request URL that throws error when accessed', () => {
      // Arrange
      const problematicRequest = new Proxy({} as HttpRequest<unknown>, {
        get(target, prop) {
          if (prop === 'url') {
            throw new Error('URL access error');
          }
          return target[prop as keyof typeof target];
        },
      });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = TestBed.runInInjectionContext(() =>
        apiBaseInterceptor(problematicRequest, mockNext),
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(problematicRequest);
      expect(result).toBe(problematicRequest);
      expect(consoleSpy).toHaveBeenCalledWith('api-base: url not readable', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle URL with only API segment (no tail)', () => {
      // Arrange
      const originalUrl = '/restaurante/v1';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/restaurante/v1';

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should handle URL with API segment in the middle (should not match)', () => {
      // Arrange
      const originalUrl = '/api/restaurante/v1/something';
      const request = new HttpRequest('GET', originalUrl);

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(request);
    });

    it('should handle case-sensitive URL matching', () => {
      // Arrange
      const originalUrl = '/RESTAURANTE/V1/productos';
      const request = new HttpRequest('GET', originalUrl);

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(request);
    });

    it('should handle URL with similar but different segment', () => {
      // Arrange
      const originalUrl = '/restaurante/v2/productos';
      const request = new HttpRequest('GET', originalUrl);

      // Act
      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      // Assert
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(request);
    });
  });

  describe('normalizeBase function', () => {
    it('should remove single trailing slash', () => {
      // This tests the internal normalizeBase function indirectly
      mockAppConfigService.apiBase = 'http://localhost:8080/api/';
      const originalUrl = '/restaurante/v1/test';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/api/test';

      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should remove multiple trailing slashes', () => {
      mockAppConfigService.apiBase = 'http://localhost:8080/api////';
      const originalUrl = '/restaurante/v1/test';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/api/test';

      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });

    it('should not modify base without trailing slashes', () => {
      mockAppConfigService.apiBase = 'http://localhost:8080/api';
      const originalUrl = '/restaurante/v1/test';
      const request = new HttpRequest('GET', originalUrl);
      const expectedUrl = 'http://localhost:8080/api/test';

      const result = TestBed.runInInjectionContext(() => apiBaseInterceptor(request, mockNext));

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl,
        }),
      );
    });
  });
});
