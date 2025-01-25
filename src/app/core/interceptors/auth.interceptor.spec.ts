import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { authInterceptor } from './auth.interceptor';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let interceptor: HttpInterceptorFn;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const userServiceMock = {
      getToken: jest.fn()
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

  it('should add Authorization header if token is present', () => {
    const token = 'test-token';
    userService.getToken.mockReturnValue(token);

    const request = new HttpRequest('GET', '/api/test');
    const next = jest.fn((req) => of(req)); // Simula el manejador `next`

    interceptor(request, next);

    // Verifica que next haya sido llamado con la solicitud modificada
    const modifiedRequest = next.mock.calls[0][0]; // Obtiene la solicitud pasada a next
    expect(modifiedRequest.headers.get('Authorization')).toBe(token);
  });


  it('should not modify request if token is not present', () => {
    userService.getToken.mockReturnValue(null);

    const request = new HttpRequest('GET', '/api/test');
    const next = jest.fn((req) => of(req)); // Simula el manejador `next`

    interceptor(request, next);

    expect(next).toHaveBeenCalledWith(request);
  });
});
