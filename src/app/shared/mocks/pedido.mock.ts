import { ApiResponse } from '../models/api-response.model';
import { Pedido, PedidoDetalle } from '../models/pedido.model';
import { EstadoPedido } from '../constants';

export const mockPedidosResponse: ApiResponse<Pedido[]> = {
  code: 200,
  message: 'Pedidos encontrados.',
  data: [
    {
      fechaPedido: '2024-12-25',
      createdAt: '',
      updatedAt: '0001-01-01 00:00:00',
      pedidoId: 1,
      horaPedido: '12:00:00',
      delivery: true,
      estadoPedido: EstadoPedido.EstadoPedidoTerminado,
      domicilioId: 1,
      pagoId: 1,
      restauranteId: 1,
      updatedBy: '',
    },
    {
      fechaPedido: '2024-12-30',
      createdAt: '',
      updatedAt: '0001-01-01 00:00:00',
      pedidoId: 2,
      horaPedido: '14:10:00',
      delivery: false,
      estadoPedido: EstadoPedido.EstadoPedidoIniciado,
      pagoId: 2,
      restauranteId: 1,
      updatedBy: '',
    },
    {
      fechaPedido: '2024-12-30',
      createdAt: '',
      updatedAt: '0001-01-01 00:00:00',
      pedidoId: 3,
      horaPedido: '14:30:00',
      delivery: true,
      estadoPedido: EstadoPedido.EstadoPedidoIniciado,
      domicilioId: 2,
      pagoId: 2,
      restauranteId: 1,
      updatedBy: '',
    },
  ],
};
export const mockPedidoBody: Pedido = {
  fechaPedido: '2024-12-30',
  horaPedido: '14:30:00',
  delivery: true,
  estadoPedido: EstadoPedido.EstadoPedidoIniciado,
  domicilioId: 2,
  pagoId: 2,
  restauranteId: 1,
  createdAt: '',
};

export const mockPedidoDetalle: ApiResponse<PedidoDetalle> = {
  code: 200,
  message: 'Detalle de pedido encontrado',
  data: {
    pedidoId: 1,
    fechaPedido: '2024-12-25',
    horaPedido: '12:00:00',
    delivery: true,
    estadoPedido: EstadoPedido.EstadoPedidoTerminado,
    metodoPago: 'Nequi',
    productos:
      '[{"nombre": "Coca Cola 500ml", "cantidad": 1, "subtotal": 2000, "productoId": 1, "precioUnitario": 2000}]',
    pagoId: 1,
    metodoPagoId: 1,
    domicilioId: 1,
    documentoCliente: 1015466495,
  },
};

export const mockPedidosFiltroResponse: ApiResponse<Pedido[]> = {
  code: 200,
  message: 'Filtrado ok',
  data: [
    {
      fechaPedido: '2025-09-15',
      createdAt: '',
      updatedAt: '',
      pedidoId: 9,
      horaPedido: '21:00:00',
      delivery: true,
      estadoPedido: 'PENDIENTE',
      domicilioId: 1,
      pagoId: 1,
      restauranteId: 1,
      updatedBy: '',
    },
  ],
};

export const mockPedidoUpdateBody: Partial<Pedido> = {
  delivery: true,
};

export const mockPedidoDeleteResponse = { code: 200, message: 'Pedido eliminado', data: {} };
