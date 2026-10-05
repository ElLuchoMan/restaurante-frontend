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
 * `monto` debe ser distinto de 0 y `metodoPagoId` es el id numérico del método.
 */
export interface PagoCreate {
  estadoPago: estadoPago;
  fechaPago: string;
  horaPago: string;
  metodoPagoId: number;
  monto: number;
  updatedBy?: string;
}

/**
 * Cuerpo de PUT /pagos?id=: actualización parcial (merge), ningún campo es obligatorio y `{}`
 * es válido. `fecha`/`hora` son alias de `fechaPago`/`horaPago`. Solo `updatedBy` es anulable
 * (`null` lo limpia); `null` en cualquier otro campo responde 400.
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
