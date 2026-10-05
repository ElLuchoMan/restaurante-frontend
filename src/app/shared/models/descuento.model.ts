export interface PedidoDescuentoAplicado {
  pedidoDescuentoId: number;
  pedidoId: number;
  cuponId?: number;
  ofertaId?: number;
  montoDescuento: number;
  detalle?: Record<string, unknown>;
  createdAt: string;
}

export interface AplicarDescuentoRequest {
  cuponId?: number;
  ofertaId?: number;
  montoDescuento: number;
  detalle?: Record<string, unknown>;
}
