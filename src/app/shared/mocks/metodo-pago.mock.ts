import { ApiResponse } from '../models/api-response.model';
import { MetodosPago } from '../models/metodo-pago.model';

export const mockMetodoPagoRespone: ApiResponse<MetodosPago> = {
  code: 200,
  message: 'Metodo de pago encontrado',
  data: {
    metodoPagoId: 1,
    tipo: 'Nequi',
    detalle: '3042449339',
  },
};
export const mockMetodosPagoRespone: ApiResponse<MetodosPago[]> = {
  code: 200,
  message: 'Metodos de pago obtenidos exitosamente',
  data: [
    {
      metodoPagoId: 1,
      tipo: 'Nequi',
      detalle: '3042449339',
    },
    {
      metodoPagoId: 2,
      tipo: 'Daviplata',
      detalle: '3042449339',
    },
    {
      metodoPagoId: 3,
      tipo: 'Efectivo',
      detalle: 'Pago en efectivo',
    },
  ],
};
export const mockMetodoPagoBody: MetodosPago = {
  tipo: 'Nequi',
  detalle: '3042449339',
};

export const mockMetodoPagoCreateResponse: ApiResponse<MetodosPago> = {
  code: 201,
  message: 'Método de pago creado',
  data: { metodoPagoId: 4, tipo: 'Nequi', detalle: '3000000000' },
};

export const mockMetodoPagoUpdateBody: Partial<MetodosPago> = {
  detalle: '3000000000',
};

export const mockMetodoPagoUpdateResponse: ApiResponse<MetodosPago> = {
  code: 200,
  message: 'Método de pago actualizado',
  data: { metodoPagoId: 1, tipo: 'Nequi', detalle: '3000000000' },
};

export const mockMetodoPagoDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Método de pago eliminado',
  data: {},
};
