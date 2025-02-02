import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let interceptor: HttpInterceptorFn;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const userServiceMock = {
      // Se mockea el método que se usa en el interceptor
      validateTokenAndLogout: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userServiceMock }
      ]
    });

    interceptor = (req, next) =>
      TestBed.runInInjectionContext(() => authInterceptor(req, next));
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
  });

  it('should add Authorization header if validToken is present', () => {
    const token = 'test-token';
    userService.validateTokenAndLogout.mockReturnValue(token);

    const request = new HttpRequest('GET', '/api/test');
    const next = jest.fn((req) => of(req));

    interceptor(request, next);

    // Se espera que la petición clonada tenga la cabecera Authorization con el token
    const modifiedRequest = next.mock.calls[0][0];
    expect(modifiedRequest.headers.get('Authorization')).toBe(token);
  });

  it('should not modify request if validToken is not present', () => {
    userService.validateTokenAndLogout.mockReturnValue(null);

    const request = new HttpRequest('GET', '/api/test');
    const next = jest.fn((req) => of(req));

    interceptor(request, next);

    // Se espera que se invoque next() con la petición original
    expect(next).toHaveBeenCalledWith(request);
  });
});
