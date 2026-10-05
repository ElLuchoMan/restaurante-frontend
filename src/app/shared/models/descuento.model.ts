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

/** Exactamente una fuente de descuento: un cupón o una oferta (nunca ambas ni ninguna). */
type FuenteDescuento =
  { cuponId: number; ofertaId?: undefined } | { ofertaId: number; cuponId?: undefined };

/**
 * Body de POST /descuentos/pedidos?pedido_id=. Debe enviarse exactamente uno de `cuponId` u
 * `ofertaId`. NO lleva monto: el back lo calcula con el detalle del pedido (nunca confía en un
 * monto del cliente). `clienteId`: un Cliente NO lo envía (sale del token; uno distinto da 403);
 * un trabajador/administrador lo envía para actuar en nombre del dueño del pedido.
 */
export type AplicarDescuentoRequest = FuenteDescuento & {
  clienteId?: number;
  /** Objeto JSON libre; el back lo conserva y le agrega `tipo`, `codigo`/`titulo` y `scope`. */
  detalle?: Record<string, unknown>;
};

/**
 * `data` de POST /descuentos/pedidos: el descuento registrado y los importes recalculados por el
 * servidor.
 */
export interface AplicarDescuentoResponse {
  descuento: PedidoDescuentoAplicado;
  /** Suma del detalle del pedido (cantidad x precio). */
  subtotal: number;
  /** Descuento calculado por el servidor. */
  montoDescuento: number;
  /**
   * Lo que debe pagarse, nunca negativo. Si el pedido tiene pago es su nuevo `monto` (el
   * descuento ya se restó) y `pagoId` lo identifica; si no, es `subtotal - montoDescuento`.
   */
  total: number;
  pagoId?: number;
}
