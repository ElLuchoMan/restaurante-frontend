import { ApiResponse } from '../models/api-response.model';
import { Cupon, CuponRedencion, ValidarCuponResponse } from '../models/cupon.model';

export const mockCuponBienvenida: ApiResponse<Cupon> = {
  code: 200,
  message: 'Cupón obtenido exitosamente',
  data: {
    cuponId: 1,
    codigo: 'BIENVENIDA10',
    scope: 'GLOBAL',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 10,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    montoMinimo: null,
    maxUsos: null,
    limitePorCliente: null,
    activo: true,
    productoId: null,
    categoriaId: null,
    clienteId: null,
  },
};

export const mockCuponHamburguesa: ApiResponse<Cupon> = {
  code: 200,
  message: 'Cupón obtenido exitosamente',
  data: {
    cuponId: 2,
    codigo: 'HAMB5K',
    scope: 'PRODUCTO',
    tipoDescuento: 'MONTO',
    valorDescuento: 5000,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    montoMinimo: 10000,
    maxUsos: null,
    limitePorCliente: null,
    activo: true,
    productoId: 3,
    categoriaId: null,
    clienteId: null,
  },
};

export const mockCuponClienteVIP: ApiResponse<Cupon> = {
  code: 200,
  message: 'Cupón obtenido exitosamente',
  data: {
    cuponId: 3,
    codigo: 'CLIENTEVIP20',
    scope: 'CLIENTE',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 20,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    montoMinimo: null,
    maxUsos: null,
    limitePorCliente: null,
    activo: true,
    productoId: null,
    categoriaId: null,
    clienteId: 1015466495,
  },
};

export const mockListaCupones: ApiResponse<Cupon[]> = {
  code: 200,
  message: 'Cupones obtenidos exitosamente',
  data: [mockCuponBienvenida.data, mockCuponHamburguesa.data, mockCuponClienteVIP.data],
};

export const mockValidarCuponExitoso: ApiResponse<ValidarCuponResponse> = {
  code: 200,
  message: 'Cupón validado exitosamente',
  data: {
    aplicable: true,
    montoDescuento: 2000,
    motivo: null,
  },
};

export const mockValidarCuponFallido: ApiResponse<ValidarCuponResponse> = {
  code: 200,
  message: 'Cupón validado',
  data: {
    aplicable: false,
    montoDescuento: 0,
    motivo: 'El monto mínimo requerido es 10000',
  },
};

export const mockRedencionCupon: ApiResponse<CuponRedencion> = {
  code: 200,
  message: 'Cupón redimido exitosamente',
  data: {
    redencionId: 1,
    cuponId: 1,
    codigo: 'BIENVENIDA10',
    clienteId: 1015466495,
    pedidoId: 1,
    montoDescuento: 2000,
    fechaRedencion: '2025-01-15T14:30:00Z',
  },
};
