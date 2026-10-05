import { EstadoPedido } from '../constants';

export interface Pedido {
  fechaPedido: string;
  createdAt: string;
  updatedAt?: string;
  pedidoId?: number;
  horaPedido: string;
  delivery: boolean;
  estadoPedido: EstadoPedido;
  domicilioId?: number;
  pagoId?: number;
  documentoCliente?: number;
  restauranteId: number;
  updatedBy?: string;
}

export type PedidoCreate = {
  delivery: boolean;
  restauranteId?: number;
  pk_id_domicilio?: number;
};

export interface PedidoDetalle {
  pedidoId: number;
  fechaPedido: string;
  horaPedido: string;
  delivery: boolean;
  estadoPedido: EstadoPedido;
  metodoPago: string;
  productos: string;
  pagoId: number;
  metodoPagoId: number;
  domicilioId: number;
  documentoCliente: number;
}
