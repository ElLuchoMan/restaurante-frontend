import { ApiResponse } from '../models/api-response.model';
import { metodosPago } from '../models/metodo-pago.model';

export const mockMetodoPagoRespone: ApiResponse<metodosPago> = {
  code: 200,
  message: 'Metodo de pago encontrado',
  data: {
    metodoPagoId: 1,
    tipo: 'Nequi',
    detalle: '3042449339',
  },
};
export const mockMetodosPagoRespone: ApiResponse<metodosPago[]> = {
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
export const mockMetodoPagoBody: metodosPago = {
  tipo: 'Nequi',
  detalle: '3042449339',
};
