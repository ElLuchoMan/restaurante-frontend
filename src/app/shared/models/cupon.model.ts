import { CuponScope, FkRef, TipoDescuento } from './descuento-types.model';

/** Cupón tal como lo devuelve el back (`models.Cupon.MarshalJSON`). */
export interface Cupon {
  cuponId: number;
  codigo: string;
  scope: CuponScope;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  /** Formato de respuesta `DD-MM-YYYY` (en la petición se envía `YYYY-MM-DD`). */
  fechaInicio: string;
  /** Formato de respuesta `DD-MM-YYYY` (en la petición se envía `YYYY-MM-DD`). */
  fechaFin: string;
  /** El back omite los opcionales sin valor (nunca envía `null`). */
  montoMinimo?: number;
  maxUsos?: number;
  limitePorCliente?: number;
  activo: boolean;
  /**
   * FK serializadas como objeto relacionado cargado (ver `FkRef`); el producto va sin imagen y
   * el cliente sin contraseña.
   */
  productoId?: number | FkRef<'productoId'>;
  categoriaId?: number | FkRef<'categoriaId'>;
  documentoCliente?: number | FkRef<'documentoCliente'>;
}

/** Body de POST /cupones. */
export interface CrearCuponRequest {
  /** 3 a 50 caracteres */
  codigo: string;
  scope: CuponScope;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  /** `YYYY-MM-DD` */
  fechaInicio: string;
  /** `YYYY-MM-DD` */
  fechaFin: string;
  montoMinimo?: number;
  maxUsos?: number;
  limitePorCliente?: number;
  /** Sólo con scope PRODUCTO */
  productoId?: number;
  /** Sólo con scope CATEGORIA */
  categoriaId?: number;
  /** Documento del cliente; sólo con scope CLIENTE */
  documentoCliente?: number;
}

/**
 * Body de PUT /cupones (merge): los campos ausentes se conservan. Admiten `null` (se limpian)
 * sólo `maxUsos`, `limitePorCliente`, `montoMinimo`, `productoId`, `categoriaId` y
 * `documentoCliente`; `null` en cualquier otro campo da 400. `activo` permite reactivar.
 */
export type ActualizarCuponRequest = Partial<
  Omit<
    CrearCuponRequest,
    | 'montoMinimo'
    | 'maxUsos'
    | 'limitePorCliente'
    | 'productoId'
    | 'categoriaId'
    | 'documentoCliente'
  >
> & {
  montoMinimo?: number | null;
  maxUsos?: number | null;
  limitePorCliente?: number | null;
  productoId?: number | null;
  categoriaId?: number | null;
  documentoCliente?: number | null;
  activo?: boolean;
};

export interface ValidarCuponItemRequest {
  productoId: number;
  cantidad: number;
  precio: number;
}

export interface ValidarCuponRequest {
  codigo: string;
  /** Documento del cliente */
  /** Debe ser > 0 (400 si no). */
  clienteId: number;
  pedidoId?: number;
  /** Al menos 1 ítem (400 si viene vacío). */
  items: ValidarCuponItemRequest[];
}

/** Responde 200 con `aplicable` true/false; los errores de servicio dan 500. */
export interface ValidarCuponResponse {
  aplicable: boolean;
  montoDescuento: number;
  /** Sólo viene cuando `aplicable` es false. */
  motivo?: string;
}

export interface RedimirCuponRequest {
  /** Documento del cliente (> 0) */
  clienteId: number;
  pedidoId?: number;
}

/** Redención tal como la devuelve el back (`models.CuponRedencion.MarshalJSON`). */
export interface CuponRedencion {
  cuponRedencionId: number;
  cuponId: number | FkRef<'cuponId'>;
  documentoCliente: number | FkRef<'documentoCliente'>;
  pedidoId?: number | FkRef<'pedidoId'>;
  montoDescuento: number;
  /** `DD-MM-YYYY HH:mm:ss` (hora de Bogotá) */
  createdAt: string;
}

/** Query de GET /cupones. */
export interface CuponParams {
  limit?: number;
  offset?: number;
  activo?: boolean;
  scope?: CuponScope;
  codigo?: string;
  /** `YYYY-MM-DD` */
  fecha_desde?: string;
  /** `YYYY-MM-DD` */
  fecha_hasta?: string;
}

/** Query de GET /cupones/redenciones. */
export interface CuponRedencionParams {
  limit?: number;
  offset?: number;
  cupon_codigo?: string;
  cupon_id?: number;
  cliente_id?: number;
}
