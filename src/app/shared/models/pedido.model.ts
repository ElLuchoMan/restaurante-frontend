export interface Pedido {
  fechaPedido: string;
  createdAt: string;
  updatedAt?: string;
  pedidoId?: number;
  horaPedido: string;
  delivery: boolean;
  estadoPedido: string;
  domicilioId?: number;
  pagoId: number;
  restauranteId: number;
  updatedBy?: string;
}

export interface PedidoCreate {
  delivery: boolean;
}

export interface PedidoDetalle {
  pedidoId: number;
  fechaPedido: string;
  horaPedido: string;
  delivery: boolean;
  estadoPedido: string;
  metodoPago: string;
  productos: string;
  pagoId: number;
  metodoPagoId: number;
  domicilioId: number;
  documentoCliente: number;
}
