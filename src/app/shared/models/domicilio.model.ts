import { estadoPago } from '../constants';

export interface Domicilio {
  fechaDomicilio: string;
  createdAt?: string;
  updatedAt?: string;
  domicilioId?: number;
  direccion: string;
  telefono: string;
  estadoPago: estadoPago;
  entregado: boolean;
  observaciones: string;
  createdBy: string;
  updatedBy?: string;
  trabajadorAsignado?: number;
  trabajadorNombre?: string;
}

export type DomicilioRequest = Omit<
  Domicilio,
  | 'entregado'
  | 'createdAt'
  | 'updatedAt'
  | 'domicilioId'
  | 'trabajadorAsignado'
  | 'trabajadorNombre'
>;

export interface DomicilioDetalle {
  cliente: {
    documento: number;
    nombre: string;
    apellido: string;
  };
  pedido: {
    montoPago: number;
    pagoId: number;
    pedidoId: number;
    subtotalProductos: number;
    total: number;
    productos: any[];
  };
  domicilio: Domicilio;
}
