import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let interceptor: HttpInterceptorFn;

  const clearAuthCookie = () => {
    document.cookie =
      'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = (req, next) =>
      TestBed.runInInjectionContext(() => authInterceptor(req, next));
    clearAuthCookie();
  });

  afterEach(() => {
    clearAuthCookie();
  });

  it('should add Authorization header and credentials when token is present', () => {
    document.cookie = 'auth_token=test-token';
    const request = new HttpRequest('GET', '/api/test');
    const next = jest.fn((req) => of(req));

    interceptor(request, next);

    const modifiedRequest = next.mock.calls[0][0];
    expect(modifiedRequest.headers.get('Authorization')).toBe(
      'Bearer test-token'
    );
    expect(modifiedRequest.withCredentials).toBe(true);
  });

  it('should send request with credentials only when token is absent', () => {
    const request = new HttpRequest('GET', '/api/test');
    const next = jest.fn((req) => of(req));

    interceptor(request, next);

    const modifiedRequest = next.mock.calls[0][0];
    expect(modifiedRequest.headers.has('Authorization')).toBe(false);
    expect(modifiedRequest.withCredentials).toBe(true);
  });
});

