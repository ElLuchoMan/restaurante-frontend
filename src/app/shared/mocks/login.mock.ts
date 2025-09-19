import { ApiResponse } from '../models/api-response.model';
import { Login, LoginResponse } from '../models/login.model';

export const mockLogin: Login = {
  documento: 12345,
  password: 'password',
};

export const mockLoginResponse: ApiResponse<LoginResponse> = {
  code: 200,
  message: 'Inicio de sesión exitoso',
  data: {
    token: 'testToken', // mantener compatibilidad hacia atrás
    access_token: 'testAccessToken',
    refresh_token: 'testRefreshToken',
    nombre: 'Test User',
  },
};
