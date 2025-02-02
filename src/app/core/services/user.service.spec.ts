import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from './handle-error.service';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const mockHandleErrorService = {
    handleError: jest.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: HandleErrorService, useValue: mockHandleErrorService }
      ]
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request and return response', () => {
    const mockResponse = { data: { token: 'testToken' } };
    const credentials = { documento: '123', password: 'password' };

    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockResponse);
  });

  it('should handle error on login request', () => {
    const credentials = { documento: '123', password: 'password' };
    service.login(credentials).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/login`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('should save token to localStorage', () => {
    const token = 'testToken';
    service.saveToken(token);
    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('should get token from localStorage', () => {
    const token = 'testToken';
    localStorage.setItem('auth_token', token);
    expect(service.getToken()).toBe(token);
  });

  it('should return null if window is undefined', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as any).window;
    const token = service.getToken();
    expect(token).toBe(null);
    globalThis.window = originalWindow;
  });

  it('should decode token correctly', () => {
    const tokenPayload = { rol: 'Administrador', exp: Math.floor(Date.now() / 1000) + 1000 };
    const token = btoa(JSON.stringify(tokenPayload));
    localStorage.setItem('auth_token', `header.${token}.signature`);
    const decoded = service.decodeToken();
    expect(decoded).toEqual({ rol: 'Administrador', exp: expect.any(Number) });
  });

  it('should log an error and return null if token decoding fails', () => {
    const invalidToken = 'invalid.token.value';
    jest.spyOn(service, 'getToken').mockReturnValue(invalidToken);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = service.decodeToken();
    expect(consoleSpy).toHaveBeenCalledWith('Error al decodificar el token:', expect.any(Error));
    expect(result).toBe(null);
    consoleSpy.mockRestore();
  });

  it('should return null if no token is found', () => {
    jest.spyOn(service, 'getToken').mockReturnValue(null);
    const result = service.decodeToken();
    expect(result).toBe(null);
  });

  it('should return user role if token is valid', () => {
    const decodedToken = { rol: 'Administrador', exp: Math.floor(Date.now() / 1000) + 1000 };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.getUserRole();
    expect(result).toBe('Administrador');
  });

  it('should return null if token is invalid', () => {
    jest.spyOn(service, 'decodeToken').mockReturnValue(null);
    const result = service.getUserRole();
    expect(result).toBe(null);
  });

  it('should identify expired token', () => {
    const expiredTokenPayload = { exp: Math.floor(Date.now() / 1000) - 1000 };
    const expiredToken = btoa(JSON.stringify(expiredTokenPayload));
    localStorage.setItem('auth_token', `header.${expiredToken}.signature`);
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should identify valid token', () => {
    const validTokenPayload = { exp: Math.floor(Date.now() / 1000) + 1000 };
    const validToken = btoa(JSON.stringify(validTokenPayload));
    localStorage.setItem('auth_token', `header.${validToken}.signature`);
    expect(service.isTokenExpired()).toBe(false);
  });

  it('should return true if decodeToken returns null', () => {
    jest.spyOn(service, 'decodeToken').mockReturnValue(null);
    const result = service.isTokenExpired();
    expect(result).toBe(true);
  });

  it('should return true if decoded token does not have exp property', () => {
    const decodedToken = { rol: 'Usuario' };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.isTokenExpired();
    expect(result).toBe(true);
  });

  it('should remove token on logout', () => {
    localStorage.setItem('auth_token', 'testToken');
    service.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should send registroCliente request and return response', () => {
    const mockResponse = { data: { id: 1, nombre: 'Cliente Prueba' } };
    const cliente = {
      documentoCliente: 123456,
      nombre: 'Cliente Prueba',
      apellido: 'Apellido Cliente',
      direccion: 'Dirección Cliente',
      telefono: '123456789',
      nuevo: true,
      password: 'password123',
      restauranteId: 1,
      observaciones: 'Sin observaciones'
    };

    service.registroCliente(cliente).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/clientes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(cliente);
    req.flush(mockResponse);
  });

  it('should send registroTrabajador request and return response', () => {
    const mockResponse = { data: { id: 1, nombre: 'Trabajador Prueba' } };
    const trabajador = {
      documentoTrabajador: 987654,
      nombre: 'Trabajador Prueba',
      apellido: 'Apellido Trabajador',
      fechaIngreso: new Date('2023-01-01').toISOString(),
      fechaNacimiento: new Date('1990-01-01').toISOString(),
      horario: '8:00 - 17:00',
      nuevo: true,
      password: 'password123',
      restauranteId: 1,
      rol: 'Cocinero',
      sueldo: 2000000,
      telefono: '987654321'
    };

    service.registroTrabajador(trabajador).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/trabajadores`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(trabajador);
    req.flush(mockResponse);
  });

  // Tests para validateTokenAndLogout

  it('should call logout if token is expired in validateTokenAndLogout', () => {
    const expiredPayload = { rol: 'Cliente', documento: '123', exp: Math.floor(Date.now() / 1000) - 10 };
    const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
    localStorage.setItem('auth_token', expiredToken);
    const logoutSpy = jest.spyOn(service, 'logout');
    service.validateTokenAndLogout();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should not call logout if token is valid in validateTokenAndLogout', () => {
    const validPayload = { rol: 'Cliente', documento: '123', exp: Math.floor(Date.now() / 1000) + 3600 };
    const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
    localStorage.setItem('auth_token', validToken);
    const logoutSpy = jest.spyOn(service, 'logout');
    service.validateTokenAndLogout();
    expect(logoutSpy).not.toHaveBeenCalled();
  });
  // Tests para getAuthState()
  it('should allow subscription to auth state and emit false when not logged in', (done) => {
    // Inicialmente, sin token, el estado de autenticación es false.
    service.getAuthState().subscribe(state => {
      expect(state).toBe(false);
      done();
    });
  });
  // Tests para getUserId()
  it('should return user id if token is valid', () => {
    const decodedToken = { rol: 'Cliente', documento: '12345', exp: Math.floor(Date.now() / 1000) + 1000 };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.getUserId();
    expect(result).toBe('12345');
  });

  it('should return null for user id if token is invalid', () => {
    jest.spyOn(service, 'decodeToken').mockReturnValue(null);
    const result = service.getUserId();
    expect(result).toBeNull();
  });
});
