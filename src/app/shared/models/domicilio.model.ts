import { estadoDomicilio } from '../constants';

export interface Domicilio {
  fechaDomicilio: string;
  createdAt?: string;
  updatedAt?: string;
  domicilioId?: number;
  direccion: string;
  telefono: string;
  estadoDomicilio: estadoDomicilio;
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
    productos: Array<{
      PK_ID_PRODUCTO?: number;
      productoId?: number;
      NOMBRE?: string;
      nombre?: string;
      CANTIDAD?: number;
      cantidad?: number;
      PRECIO_UNITARIO?: number;
      precioUnitario?: number;
      PRECIO?: number;
      SUBTOTAL?: number;
      subtotal?: number;
    }>;
  };
  domicilio: Domicilio;
}
