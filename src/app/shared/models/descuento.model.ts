import { FkRef } from './descuento-types.model';

/** Descuento aplicado a un pedido (`models.PedidoDescuentoAplicado.MarshalJSON`). */
export interface PedidoDescuentoAplicado {
  pedidoDescuentoId: number;
  /** FK serializadas como objeto relacionado (ver `FkRef`). */
  pedidoId: number | FkRef<'pedidoId'>;
  cuponId?: number | FkRef<'cuponId'>;
  ofertaId?: number | FkRef<'ofertaId'>;
  montoDescuento: number;
  detalle?: Record<string, unknown>;
  /** `DD-MM-YYYY HH:mm:ss` (hora de Bogotá) */
  createdAt: string;
}

/**
 * Body de POST /descuentos/pedidos?pedido_id=. Debe enviarse exactamente uno de
 * `cuponId` u `ofertaId`.
 */
export interface AplicarDescuentoRequest {
  cuponId?: number;
  ofertaId?: number;
  montoDescuento: number;
  detalle?: Record<string, unknown>;
}
