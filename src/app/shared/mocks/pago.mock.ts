import { estadoPago } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Pago, PagoCreate } from '../models/pago.model';

export const mockPagosResponse: ApiResponse<Pago[]> = {
  code: 200,
  message: 'Pago encontrado',
  data: [
    {
      fechaPago: '2024-12-24',
      updatedAt: '0000-12-31 19:03:44',
      pagoId: 1,
      horaPago: '12:05:00',
      monto: 2000,
      estadoPago: estadoPago.PAGADO,
      metodoPagoId: 1,
      updatedBy: 'Administrador - Bryan Luis',
    },
    {
      fechaPago: '2024-12-29',
      updatedAt: '0000-12-31 19:03:44',
      pagoId: 2,
      horaPago: '14:15:00',
      monto: 1800,
      estadoPago: estadoPago.PENDIENTE,
      metodoPagoId: 2,
      updatedBy: 'Administrador - Bryan Luis',
    },
  ],
};
export const mockPagoResponse: ApiResponse<Pago> = {
  code: 200,
  message: 'Pago creado exitosamente',
  data: {
    fechaPago: '2024-12-24',
    updatedAt: '0000-12-31 19:03:44',
    pagoId: 1,
    horaPago: '12:05:00',
    monto: 2000,
    estadoPago: estadoPago.PAGADO,
    metodoPagoId: 1,
    updatedBy: 'Administrador - Bryan Luis',
  },
};
export const mockPagoBody: PagoCreate = {
  fechaPago: '2024-12-24',
  horaPago: '12:05:00',
  monto: 2000,
  estadoPago: estadoPago.PAGADO,
  metodoPagoId: 1,
};

export const mockPagoUpdateBody = {
  monto: 2200,
  updatedBy: 'Administrador - Bryan Luis',
};

export const mockPagoUpdateResponse: ApiResponse<Pago> = {
  code: 200,
  message: 'Pago actualizado',
  data: {
    ...mockPagoResponse.data,
    monto: 2200,
  },
};

export const mockPagoDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Pago eliminado',
  data: {},
};
