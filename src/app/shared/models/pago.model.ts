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

export type PagoCreate = Omit<Pago, 'pagoId' | 'updatedAt' | 'updatedBy'>;
// El backend permite actualizar estadoPago, fecha, hora, metodoPagoId, monto y updatedBy
export type PagoUpdate = Partial<PagoCreate> & { updatedBy?: string };
