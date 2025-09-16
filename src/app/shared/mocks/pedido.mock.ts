import { ApiResponse } from '../models/api-response.model';
import { Pedido, PedidoDetalle } from '../models/pedido.model';

export const mockPedidosResponse: ApiResponse<Pedido[]> = {
  code: 200,
  message: 'Pedidos encontrados.',
  data: [
    {
      fechaPedido: '25-12-2024',
      createdAt: '',
      updatedAt: '01-01-0001 00:00:00',
      pedidoId: 1,
      horaPedido: '0000-01-01 12:00:00 +0000 UTC',
      delivery: true,
      estadoPedido: 'TERMINADO',
      domicilioId: 1,
      pagoId: 1,
      restauranteId: 1,
      updatedBy: '',
    },
    {
      fechaPedido: '30-12-2024',
      createdAt: '',
      updatedAt: '01-01-0001 00:00:00',
      pedidoId: 2,
      horaPedido: '0000-01-01 14:10:00 +0000 UTC',
      delivery: false,
      estadoPedido: 'INICIADO',
      pagoId: 2,
      restauranteId: 1,
      updatedBy: '',
    },
    {
      fechaPedido: '30-12-2024',
      createdAt: '',
      updatedAt: '01-01-0001 00:00:00',
      pedidoId: 3,
      horaPedido: '0000-01-01 14:30:00 +0000 UTC',
      delivery: true,
      estadoPedido: 'INICIADO',
      domicilioId: 2,
      pagoId: 2,
      restauranteId: 1,
      updatedBy: '',
    },
  ],
};
export const mockPedidoBody: Pedido = {
  fechaPedido: '30-12-2024',
  horaPedido: '14:30',
  delivery: true,
  estadoPedido: 'INICIADO',
  domicilioId: 2,
  pagoId: 2,
  restauranteId: 1,
  createdAt: '',
};

export const mockPedidoDetalle: ApiResponse<PedidoDetalle> = {
  code: 200,
  message: 'Detalle de pedido encontrado',
  data: {
    PK_ID_PEDIDO: 0,
    FECHA: '',
    HORA: '',
    delivery: false,
    ESTADO_PEDIDO: '',
    METODO_PAGO: 'Nequi',
    PRODUCTOS:
      '[{"NOMBRE": "Coca Cola 500ml", "CANTIDAD": 1, "SUBTOTAL": 2000, "PK_ID_PRODUCTO": 1, "PRECIO_UNITARIO": 2000}]',
  },
};

export const mockPedidosFiltroResponse: ApiResponse<Pedido[]> = {
  code: 200,
  message: 'Filtrado ok',
  data: [
    {
      fechaPedido: '15-09-2025',
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
