import { estadoPago } from '../constants';
import { Pedido } from './pedido.model';
import { InventarioInsuficiente } from './producto-pedido.model';

/** Línea de `CheckoutRequest.productos`: `cantidad` debe ser > 0 (las repetidas se suman). */
export interface CheckoutProducto {
  productoId: number;
  cantidad: number;
}

/**
 * Domicilio opcional del checkout. Si viene, el pedido es `delivery`. El estado nace PENDIENTE y
 * `fechaDomicilio` (YYYY-MM-DD) por defecto es hoy en Bogotá.
 */
export interface CheckoutDomicilio {
  direccion: string;
  telefono: string;
  fechaDomicilio?: string;
  observaciones?: string;
}

/**
 * Pago del checkout. El monto lo calcula el servidor (el carrito nunca lo envía). `fechaPago`
 * (YYYY-MM-DD) y `horaPago` (HH:MM[:SS]) por defecto son ahora en Bogotá; `estadoPago` por
 * defecto PENDIENTE (un Cliente solo puede PENDIENTE: 403 si no).
 */
export interface CheckoutPago {
  metodoPagoId: number;
  fechaPago?: string;
  horaPago?: string;
  estadoPago?: estadoPago;
}

/**
 * Cuerpo de POST /pedidos/checkout: crea en UNA transacción el domicilio (opcional), el pedido,
 * sus productos (descontando inventario) y el pago. Si algo falla no queda nada guardado.
 */
export interface CheckoutRequest {
  restauranteId?: number;
  /**
   * Solo personal. Un Cliente NO lo envía: el documento sale del token y uno distinto responde 403.
   */
  documentoCliente?: number;
  domicilio?: CheckoutDomicilio;
  productos: CheckoutProducto[];
  pago: CheckoutPago;
}

/** `data` de la respuesta 201: el pedido completo (con `pagoId` y `domicilioId`) y el monto cobrado. */
export interface CheckoutResultado extends Pedido {
  /** Total que fijó el servidor (`MAX(0, SUM(precio x cantidad) - descuentos)`). */
  monto: number;
}

/**
 * Error que lanza `PedidoService.checkout`: la forma de `HandleErrorService` más, en un 409 por
 * inventario insuficiente, el detalle por producto en `data`.
 */
export interface CheckoutError {
  code: number;
  message: string;
  cause: string;
  data?: InventarioInsuficiente[];
}
