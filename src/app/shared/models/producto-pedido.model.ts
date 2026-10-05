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

/** Elemento del `data` de la respuesta 409 de POST/PUT /producto_pedido por inventario insuficiente. */
export interface InventarioInsuficiente {
  productoId: number;
  requerido: number;
  disponible: number;
}

/**
 * Error que lanza `ProductoPedidoService`: la forma de `HandleErrorService` más, en un 409 por
 * inventario, el detalle por producto en `data`.
 */
export interface ProductoPedidoError {
  code: number;
  message: string;
  cause: string;
  data?: InventarioInsuficiente[];
}
