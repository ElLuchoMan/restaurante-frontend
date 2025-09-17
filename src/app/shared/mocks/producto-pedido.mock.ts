import { ApiResponse } from '../models/api-response.model';
import { ProductoPedido } from '../models/producto-pedido.model';

export const mockProductoPedidoResponse: ApiResponse<ProductoPedido> = {
  code: 200,
  message: 'Productos del pedido obtenidos exitosamente',
  data: {
    detallesProductos: [
      {
        cantidad: 1,
        nombre: 'Coca Cola 5<00ml',
        precioUnitario: 2000,
        productoId: 1,
        subtotal: 2000,
      },
    ],
    pedidoId: 1,
  },
};

export const mockProductoPedidoUpdateBody = [
  { productoId: 1, cantidad: 2 },
  { productoId: 3, cantidad: 1 },
];

export const mockProductoPedidoCreateBody = {
  pedidoId: 99,
  detalles: [
    { productoId: 2, cantidad: 1 },
    { productoId: 3, cantidad: 2 },
  ],
};

export const mockProductoPedidoDeleteResponse = { code: 200, message: 'Eliminado', data: {} };
