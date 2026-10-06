import { EstadoPedido } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { CheckoutRequest, CheckoutResultado } from '../models/checkout.model';
import { Pedido, PedidoCreate, PedidoDetalle } from '../models/pedido.model';

// Formas reales del back: fechaPedido DD-MM-YYYY, horaPedido HH:MM:SS y relaciones como objetos.
export const mockPedidosResponse: ApiResponse<Pedido[]> = {
  code: 200,
  message: 'Pedidos obtenidos exitosamente',
  data: [
    {
      fechaPedido: '25-12-2024',
      updatedAt: '25-12-2024 12:05:00',
      pedidoId: 1,
      horaPedido: '12:00:00',
      delivery: true,
      estadoPedido: EstadoPedido.EstadoPedidoTerminado,
      domicilioId: { domicilioId: 1 },
      pagoId: { pagoId: 1 },
      restauranteId: { restauranteId: 1 },
      documentoCliente: null,
    },
    {
      fechaPedido: '30-12-2024',
      updatedAt: '30-12-2024 14:10:00',
      pedidoId: 2,
      horaPedido: '14:10:00',
      delivery: false,
      estadoPedido: EstadoPedido.EstadoPedidoIniciado,
      pagoId: { pagoId: 2 },
      restauranteId: { restauranteId: 1 },
      documentoCliente: { documentoCliente: 1015466495 },
    },
    {
      fechaPedido: '30-12-2024',
      updatedAt: '30-12-2024 14:30:00',
      pedidoId: 3,
      horaPedido: '14:30:00',
      delivery: true,
      estadoPedido: EstadoPedido.EstadoPedidoIniciado,
      domicilioId: { domicilioId: 2 },
      pagoId: { pagoId: 2 },
      restauranteId: { restauranteId: 1 },
      documentoCliente: null,
    },
  ],
};

export const mockPedidoBody: PedidoCreate = {
  delivery: true,
  restauranteId: 1,
  documentoCliente: 1015466495,
  pk_id_domicilio: 2,
};

export const mockCheckoutBody: CheckoutRequest = {
  restauranteId: 1,
  domicilio: { direccion: 'Calle 1 #2-3', telefono: '3001234567', observaciones: 'Timbre' },
  productos: [{ productoId: 1, cantidad: 2 }],
  pago: { metodoPagoId: 2 },
};

export const mockCheckoutResponse: ApiResponse<CheckoutResultado> = {
  code: 201,
  message: 'Pedido creado exitosamente',
  data: {
    pedidoId: 9,
    fechaPedido: '31-01-2025',
    horaPedido: '18:30:00',
    delivery: true,
    estadoPedido: EstadoPedido.EstadoPedidoIniciado,
    domicilioId: { domicilioId: 3 },
    pagoId: { pagoId: 4 },
    restauranteId: { restauranteId: 1 },
    documentoCliente: { documentoCliente: 1015466495 },
    updatedAt: '31-01-2025 18:30:00',
    monto: 50000,
  },
};

export const mockPedidoDetalle: ApiResponse<PedidoDetalle> = {
  code: 200,
  message: 'Detalles del pedido obtenidos exitosamente',
  data: {
    pedidoId: 1,
    fechaPedido: '25-12-2024',
    horaPedido: '12:00:00',
    delivery: true,
    estadoPedido: EstadoPedido.EstadoPedidoTerminado,
    metodoPago: 'Nequi',
    productos:
      '[{"pk_id_producto": 1, "nombre": "Coca Cola 500ml", "cantidad": 1, "precio": 2000, "subtotal": 2000}]',
    pagoId: 1,
    metodoPagoId: 1,
    domicilioId: 1,
    documentoCliente: 1015466495,
  },
};

export const mockPedidosFiltroResponse: ApiResponse<Pedido[]> = {
  code: 200,
  message: 'Pedidos obtenidos exitosamente',
  data: [
    {
      fechaPedido: '15-09-2025',
      updatedAt: '15-09-2025 21:00:00',
      pedidoId: 9,
      horaPedido: '21:00:00',
      delivery: true,
      estadoPedido: EstadoPedido.EstadoPedidoIniciado,
      domicilioId: { domicilioId: 1 },
      pagoId: { pagoId: 1 },
      restauranteId: { restauranteId: 1 },
      documentoCliente: null,
    },
  ],
};
