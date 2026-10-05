import { estadoDomicilio } from '../constants';
import { Trabajador } from './trabajador.model';

/**
 * Domicilio tal como lo devuelve el back.
 * - `fechaDomicilio` llega como DD-MM-YYYY; `createdAt` y `updatedAt` como DD-MM-YYYY HH:mm:ss.
 * - `trabajadorAsignado` NO llega como número: es un objeto de la relación en el que solo
 *   `documentoTrabajador` es fiable. Se omite si el domicilio no tiene domiciliario.
 * - `trabajadorNombre` no lo envía el back: lo rellenan localmente los componentes.
 */
export interface Domicilio {
  domicilioId: number;
  direccion: string;
  telefono: string;
  estadoDomicilio: estadoDomicilio;
  entregado: boolean;
  fechaDomicilio: string;
  observaciones?: string;
  /** El back siempre los envía; son opcionales para poder armar domicilios parciales en el cliente. */
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  trabajadorAsignado?: Pick<Trabajador, 'documentoTrabajador'>;
  trabajadorNombre?: string;
}

/**
 * Cuerpo de POST /domicilios. `direccion`, `telefono` y `fechaDomicilio` (YYYY-MM-DD) son
 * obligatorios; `entregado` lo calcula el back. `trabajadorAsignado` es el documento del
 * trabajador (0 se ignora).
 */
export interface DomicilioCreate {
  direccion: string;
  telefono: string;
  fechaDomicilio: string;
  estadoDomicilio?: estadoDomicilio;
  observaciones?: string;
  createdBy?: string;
  trabajadorAsignado?: number;
}

/** Alias histórico de `DomicilioCreate`. */
export type DomicilioRequest = DomicilioCreate;

/**
 * Cuerpo de PUT /domicilios?id=. El back solo aplica `direccion`, `telefono` y `updatedBy`
 * (el resto de campos se ignora) y siempre refresca `updatedAt`.
 */
export interface DomicilioUpdate {
  direccion?: string;
  telefono?: string;
  updatedBy?: string;
}

/** Filtros de GET /domicilios (todos opcionales). */
export interface DomicilioListParams {
  /** Coincidencia parcial sin distinguir mayúsculas. */
  direccion?: string;
  telefono?: string;
  /** YYYY-MM-DD */
  fecha?: string;
  estado?: estadoDomicilio;
  updated_by?: string;
  /**
   * Documento del domiciliario: devuelve los no entregados que no tienen domiciliario o que
   * tiene este.
   */
  trabajador?: number;
}

/** Producto del resumen de pedido de `DomicilioDetalle`. */
export interface DomicilioDetalleProducto {
  pk_id_producto: number;
  nombre: string;
  cantidad: number;
  /** Precio unitario. */
  precio: number;
  subtotal: number;
}

/**
 * `data` de GET /domicilios/search. `cliente` y `pedido` solo vienen si hay un pedido asociado
 * al domicilio (y `pedido.productos` es null si no se pudo leer).
 */
export interface DomicilioDetalle {
  domicilio: Domicilio;
  cliente?: {
    documento: number;
    nombre: string;
    apellido: string;
  };
  pedido?: {
    pedidoId: number;
    pagoId: number | null;
    montoPago: number;
    subtotalProductos: number;
    total: number;
    productos: DomicilioDetalleProducto[] | null;
  };
}
