import { DetallesProducto } from './producto.model';

export interface ProductoPedido {
  detallesProductos: DetallesProducto[];
  pedidoId: number;
}
