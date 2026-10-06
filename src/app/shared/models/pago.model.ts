import { estadoPago } from '../constants';
import { MetodosPago } from './metodo-pago.model';

/**
 * Pago tal como lo devuelve el back.
 * - `fechaPago` llega como DD-MM-YYYY, `horaPago` como HH:MM:SS y `updatedAt` como
 *   DD-MM-YYYY HH:mm:ss.
 * - `metodoPagoId` NO llega como número: el back serializa la relación como un objeto en el que
 *   solo `metodoPagoId` es fiable (`tipo` y `detalle` vienen vacíos).
 */
export interface Pago {
  pagoId: number;
  fechaPago: string;
  horaPago: string;
  monto: number;
  estadoPago: estadoPago;
  metodoPagoId: Pick<MetodosPago, 'metodoPagoId'>;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Cuerpo de POST /pagos. `fechaPago` va como YYYY-MM-DD y `horaPago` como HH:MM[:SS];
 * `metodoPagoId` es el id numérico del método.
 *
 * El servidor manda el monto: `MAX(0, SUM(precio x cantidad del detalle) - descuentos aplicados)`
 * (no hay costo de domicilio ni propina). Un Cliente debe enviar `pedidoId` (su pedido, con
 * productos; 404 si es ajeno, 409 si no tiene productos o ya tiene pago) y su `monto` se ignora:
 * el monto real viene en la respuesta (`Pago.monto`). El personal puede enviar `pedidoId` con
 * `monto` 0/omitido (usa el calculado) o fijar un `monto` manual > 0; sin `pedidoId` el `monto`
 * es obligatorio.
 */
export interface PagoCreate {
  estadoPago: estadoPago;
  fechaPago: string;
  horaPago: string;
  metodoPagoId: number;
  /** Pedido del que el servidor calcula el monto (obligatorio para un Cliente). */
  pedidoId?: number;
  /** Solo personal (manual > 0); un Cliente no lo envía y, si lo envía, se ignora. */
  monto?: number;
  updatedBy?: string;
}

/**
 * Cuerpo de PUT /pagos?id=: actualización parcial (merge), ningún campo es obligatorio y `{}`
 * es válido. `fecha`/`hora` son alias de `fechaPago`/`horaPago`. Solo `updatedBy` es anulable
 * (`null` lo limpia); `null` en cualquier otro campo responde 400. Solo personal (403 a un
 * Cliente). `monto` no se puede cambiar si el pago ya está PAGADO o si su pedido tiene descuentos
 * aplicados (409): el monto ya refleja el descuento.
 */
export interface PagoUpdate {
  /** YYYY-MM-DD */
  fechaPago?: string;
  /** HH:MM[:SS] */
  horaPago?: string;
  /** Alias de `fechaPago`. */
  fecha?: string;
  /** Alias de `horaPago`. */
  hora?: string;
  monto?: number;
  estadoPago?: estadoPago;
  /** Debe existir (404 si no). */
  metodoPagoId?: number;
  updatedBy?: string | null;
}

/** Filtros de GET /pagos (todos opcionales; se filtran en memoria en el back). */
export interface PagoListParams {
  /** YYYY-MM-DD */
  fecha?: string;
  dia?: number;
  mes?: number;
  anio?: number;
  estado?: estadoPago;
  /** Id del método de pago. */
  metodo_pago?: number;
}
