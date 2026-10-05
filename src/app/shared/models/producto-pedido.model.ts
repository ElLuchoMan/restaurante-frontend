import { Pedido } from './pedido.model';

/** Línea enviada al back en POST/PUT /producto_pedido. */
export interface ProductoPedidoItem {
  productoId: number;
  cantidad: number;
}

/** Cuerpo de POST /producto_pedido. */
export interface ProductoPedidoCreate {
  pedidoId: number;
  detalles: ProductoPedidoItem[];
}

/**
 * Detalle de pedido tal como lo devuelve el back. `pedidoId` y `productoId` NO llegan como
 * número: son objetos de la relación en los que solo el id es fiable. `precio` es el precio
 * unitario fijado por la BD al insertar.
 */
export interface DetallePedido {
  detalleId: number;
  pedidoId: Pick<Pedido, 'pedidoId'>;
  productoId: { productoId: number };
  precio: number;
  cantidad: number;
}

/** `data` de GET/POST/PUT /producto_pedido. */
export interface ProductoPedido {
  pedidoId: number;
  detalles: DetallePedido[];
}
