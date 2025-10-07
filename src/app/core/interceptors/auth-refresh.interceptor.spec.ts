import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { delay, of, throwError } from 'rxjs';

import { createRouterMock, createUserServiceMock } from '../../shared/mocks/test-doubles';
import { UserService } from '../services/user.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

describe('AuthRefreshInterceptor', () => {
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let mockNext: jest.Mock;
  let mockRequest: HttpRequest<any>;

  beforeEach(() => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    const routerMock = createRouterMock() as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    // Crear mock para next function
    mockNext = userServiceMock.login as jest.Mock; // Reutilizar mock existente
    mockNext.mockClear(); // Limpiar para usar como mockNext

    mockRequest = new HttpRequest('GET', '/api/test');
  });

  it('should pass through successful requests', (done) => {
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    mockNext.mockReturnValue(of(mockResponse));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      next: (response) => {
        expect(response).toBe(mockResponse);
        expect(mockNext).toHaveBeenCalledWith(mockRequest);
        done();
      },
    });
  });

  it('should pass through non-401 errors', (done) => {
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    mockNext.mockReturnValue(throwError(() => mockError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        expect(userService.attemptTokenRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should pass through 401 errors for login endpoint', (done) => {
    const loginRequest = new HttpRequest('POST', '/api/login');
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(loginRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        expect(userService.attemptTokenRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should pass through 401 errors for refresh endpoint', (done) => {
    const refreshRequest = new HttpRequest('POST', '/api/auth/refresh');
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(refreshRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        expect(userService.attemptTokenRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should attempt token refresh on 401 error and retry request on success', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    const newToken = 'new-access-token';

    mockNext
      .mockReturnValueOnce(throwError(() => mockError)) // Primera llamada falla con 401
      .mockReturnValueOnce(of(mockResponse)); // Segunda llamada (retry) es exitosa

    userService.attemptTokenRefresh.mockReturnValue(of(true));
    userService.getToken.mockReturnValue(newToken);

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      next: (response) => {
        expect(response).toBe(mockResponse);
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(2);

        // Verificar que la segunda llamada incluye el nuevo token
        const retryRequest = mockNext.mock.calls[1][0] as HttpRequest<any>;
        expect(retryRequest.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
        done();
      },
    });
  });

  it('should redirect to login when token refresh fails', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));
    userService.attemptTokenRefresh.mockReturnValue(of(false));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(error.message).toBe('Token refresh failed');
        done();
      },
    });
  });

  it('should redirect to login when token refresh throws error', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const refreshError = new Error('Refresh failed');

    mockNext.mockReturnValue(throwError(() => mockError));
    userService.attemptTokenRefresh.mockReturnValue(throwError(() => refreshError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(error).toBe(refreshError);
        done();
      },
    });
  });

  it('should handle case when no new token is available after refresh', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));
    userService.attemptTokenRefresh.mockReturnValue(of(true));
    userService.getToken.mockReturnValue(null); // No token disponible

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(error.message).toBe('Token refresh failed');
        done();
      },
    });
  });

  it('should queue requests when refresh is already in progress and retry with new token', (done) => {
    // Simular dos requests concurrentes que reciben 401
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    const newToken = 'new-access-token';

    // Primera request falla con 401
    mockNext.mockReturnValueOnce(throwError(() => mockError));
    // Segunda request falla con 401
    mockNext.mockReturnValueOnce(throwError(() => mockError));
    // Retry de ambas requests después del refresh
    mockNext.mockReturnValueOnce(of(mockResponse));
    mockNext.mockReturnValueOnce(of(mockResponse));

    // Simular que el refresh toma tiempo (delay) para que la segunda request llegue durante el refresh
    userService.attemptTokenRefresh.mockReturnValue(of(true).pipe(delay(100)));
    userService.getToken.mockReturnValue(newToken);

    const interceptor = authRefreshInterceptor;

    let completedCount = 0;

    // Primera request inicia el refresh
    const result1 = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result1.subscribe({
      next: (response) => {
        expect(response).toBe(mockResponse);
        completedCount++;
        if (completedCount === 2) {
          // Verificar que attemptTokenRefresh solo se llamó una vez
          expect(userService.attemptTokenRefresh).toHaveBeenCalledTimes(1);
          done();
        }
      },
    });

    // Ejecutar la segunda request poco después para que encuentre el refresh en progreso
    setTimeout(() => {
      const result2 = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

      result2.subscribe({
        next: (response) => {
          expect(response).toBe(mockResponse);
          completedCount++;
          if (completedCount === 2) {
            expect(userService.attemptTokenRefresh).toHaveBeenCalledTimes(1);
            done();
          }
        },
      });
    }, 50); // La segunda request llega mientras la primera está refrescando
  }, 10000); // Aumentar timeout del test

  it('should error queued requests when no token is available after refresh completes', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    const newToken = 'new-access-token';

    mockNext
      .mockReturnValueOnce(throwError(() => mockError))
      .mockReturnValueOnce(throwError(() => mockError))
      .mockReturnValueOnce(of(mockResponse));

    userService.attemptTokenRefresh.mockReturnValue(of(true).pipe(delay(20)));
    userService.getToken
      .mockReturnValueOnce(newToken)
      .mockReturnValueOnce(newToken)
      .mockReturnValueOnce(null);

    const interceptor = authRefreshInterceptor;

    const firstResult = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));
    firstResult.subscribe({
      next: (response) => {
        expect(response).toBe(mockResponse);
      },
      error: (error) => fail(error),
    });

    setTimeout(() => {
      const secondResult = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

      secondResult.subscribe({
        next: () => fail('Expected queued request to error'),
        error: (error) => {
          expect(error.message).toBe('No token available');
          expect(router.navigate).not.toHaveBeenCalled();
          expect(userService.attemptTokenRefresh).toHaveBeenCalledTimes(1);
          done();
        },
      });
    }, 5);
  }, 10000);
});
