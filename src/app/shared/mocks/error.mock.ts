import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';

export const mockHttpError500 = new HttpErrorResponse({
  status: 500,
  error: {
    message: 'Internal Server Error',
    cause: 'Database connection failed',
  },
});

export const mockHttpError400 = new HttpErrorResponse({
  status: 400,
  error: {},
});

// ApiResponse-based error mocks per resource
export const error400Clientes: ApiResponse<unknown> = {
  code: 400,
  message: 'Bad Request',
  cause: 'Parámetros inválidos',
  data: null as any,
};

export const error404Clientes: ApiResponse<unknown> = {
  code: 404,
  message: 'Cliente no encontrado',
  data: null as any,
};

export const error400Reservas: ApiResponse<unknown> = {
  code: 400,
  message: 'Bad Request',
  cause: 'Fecha inválida',
  data: null as any,
};

export const error404Reservas: ApiResponse<unknown> = {
  code: 404,
  message: 'Reserva no encontrada',
  data: null as any,
};

export const error400Pedidos: ApiResponse<unknown> = {
  code: 400,
  message: 'Bad Request',
  cause: 'Items requeridos',
  data: null as any,
};

export const error404Pedidos: ApiResponse<unknown> = {
  code: 404,
  message: 'Pedido no encontrado',
  data: null as any,
};

export const error400Domicilios: ApiResponse<unknown> = {
  code: 400,
  message: 'Bad Request',
  cause: 'Dirección inválida',
  data: null as any,
};

export const error404Domicilios: ApiResponse<unknown> = {
  code: 404,
  message: 'Domicilio no encontrado',
  data: null as any,
};

export const error400Pagos: ApiResponse<unknown> = {
  code: 400,
  message: 'Bad Request',
  cause: 'Monto inválido',
  data: null as any,
};

export const error404Pagos: ApiResponse<unknown> = {
  code: 404,
  message: 'Pago no encontrado',
  data: null as any,
};
