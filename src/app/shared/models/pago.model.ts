import { estadoPago } from '../constants';

export interface Pago {
  estadoPago: estadoPago;
  fechaPago: string;
  horaPago: string;
  metodoPagoId: number;
  monto: number;
  pagoId?: number;
  updatedAt?: string;
  updatedBy?: string;
}
