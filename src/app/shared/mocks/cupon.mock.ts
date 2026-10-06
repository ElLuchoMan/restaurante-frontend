import { ApiResponse } from '../models/api-response.model';
import { Cupon, CuponRedencion, ValidarCuponResponse } from '../models/cupon.model';
import { PaginatedData } from '../models/descuento-types.model';

// Los mocks reflejan el JSON real del back: fechas `DD-MM-YYYY`, opcionales ausentes (no null)
// y las FK (productoId, categoriaId, documentoCliente) serializadas como objeto relacionado.

export const mockCuponBienvenida: ApiResponse<Cupon> = {
  code: 200,
  message: 'Cupón obtenido exitosamente',
  data: {
    cuponId: 1,
    codigo: 'BIENVENIDA10',
    scope: 'GLOBAL',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 10,
    fechaInicio: '01-01-2025',
    fechaFin: '31-12-2025',
    activo: true,
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
    fechaInicio: '01-01-2025',
    fechaFin: '31-12-2025',
    montoMinimo: 10000,
    activo: true,
    productoId: { productoId: 3 },
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
    fechaInicio: '01-01-2025',
    fechaFin: '31-12-2025',
    activo: true,
    documentoCliente: { documentoCliente: 1015466495 },
  },
};

export const mockListaCupones: ApiResponse<PaginatedData<Cupon>> = {
  code: 200,
  message: 'Cupones obtenidos exitosamente',
  data: {
    data: [mockCuponBienvenida.data, mockCuponHamburguesa.data, mockCuponClienteVIP.data],
    total: 3,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  },
};

export const mockValidarCuponExitoso: ApiResponse<ValidarCuponResponse> = {
  code: 200,
  message: 'Cupón validado exitosamente',
  data: {
    aplicable: true,
    montoDescuento: 2000,
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
  code: 201,
  message: 'Cupón redimido exitosamente',
  data: {
    cuponRedencionId: 1,
    cuponId: { cuponId: 1 },
    documentoCliente: { documentoCliente: 1015466495 },
    pedidoId: { pedidoId: 1 },
    montoDescuento: 2000,
    createdAt: '15-01-2025 14:30:00',
  },
};
