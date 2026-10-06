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

/** Campos comunes de POST /cupones/validar. */
interface ValidarCuponBase {
  codigo: string;
  /**
   * Documento del cliente. Un usuario Cliente NO lo envía: el back lo toma del token (si lo envía
   * y no coincide con su documento responde 403). Un trabajador/administrador actúa en nombre de
   * un cliente y debe enviarlo (400 si falta).
   */
  clienteId?: number;
}

/**
 * Body de POST /cupones/validar. Con `pedidoId` el back evalúa el detalle REAL del pedido (debe
 * ser del cliente: 404 si no existe, 403 si es de otro) e ignora `items`; sin `pedidoId`, `items`
 * (al menos 1) es obligatorio y el resultado es solo una vista previa no vinculante.
 */
export type ValidarCuponRequest = ValidarCuponBase &
  (
    | { pedidoId: number; items?: ValidarCuponItemRequest[] }
    | { pedidoId?: undefined; items: ValidarCuponItemRequest[] }
  );

/**
 * Responde 200 con `aplicable` true/false; los errores de servicio dan 500 (401 sin sesión, 403
 * si `clienteId` no es el del token o el pedido es de otro cliente, 404 si el pedido no existe).
 */
export interface ValidarCuponResponse {
  aplicable: boolean;
  montoDescuento: number;
  /** Sólo viene cuando `aplicable` es false. */
  motivo?: string;
}

/**
 * Body de POST /cupones/{codigo}/redimir. `pedidoId` es obligatorio (400 si falta) y el pedido
 * debe pertenecer al cliente. `clienteId`: un Cliente NO lo envía (sale del token; uno distinto
 * da 403); un trabajador/administrador lo envía para actuar en nombre de un cliente.
 */
export interface RedimirCuponRequest {
  clienteId?: number;
  pedidoId: number;
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
