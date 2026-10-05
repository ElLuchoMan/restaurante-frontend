import { DetallesProducto } from './producto.model';

export interface ProductoPedido {
  detalles: DetallesProducto[];
  pedidoId: number;
}
