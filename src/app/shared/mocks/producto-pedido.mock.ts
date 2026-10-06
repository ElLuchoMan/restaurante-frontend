import { ApiResponse } from '../models/api-response.model';
import {
  InventarioInsuficiente,
  ProductoPedido,
  ProductoPedidoCreate,
} from '../models/producto-pedido.model';

export const mockProductoPedidoResponse: ApiResponse<ProductoPedido> = {
  code: 200,
  message: 'Productos del pedido obtenidos exitosamente',
  data: {
    pedidoId: 1,
    detalles: [
      {
        detalleId: 10,
        pedidoId: { pedidoId: 1 },
        productoId: { productoId: 1 },
        precio: 2000,
        cantidad: 1,
      },
    ],
  },
};

export const mockProductoPedidoUpdateBody = [
  { productoId: 1, cantidad: 2 },
  { productoId: 3, cantidad: 1 },
];

export const mockProductoPedidoCreateBody: ProductoPedidoCreate = {
  pedidoId: 1,
  detalles: [
    { productoId: 2, cantidad: 1 },
    { productoId: 3, cantidad: 2 },
  ],
};

/** `data` del 409 de POST/PUT /producto_pedido por inventario insuficiente. */
export const mockInventarioInsuficiente: InventarioInsuficiente[] = [
  { productoId: 1, requerido: 5, disponible: 2 },
];

/** Cuerpo de error del back (HTTP 409) por inventario insuficiente. */
export const mockInventarioInsuficienteBody: ApiResponse<InventarioInsuficiente[]> = {
  code: 409,
  message: 'Inventario insuficiente para uno o más productos',
  data: mockInventarioInsuficiente,
};
