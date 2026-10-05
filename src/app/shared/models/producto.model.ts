import { estadoProducto } from '../constants';

/**
 * Producto tal como lo serializa el back (`models.Producto.MarshalJSON`): productoId, nombre,
 * calorias (puede ser `null`), descripcion (se omite si es null), precio (entero), estadoProducto,
 * imagen (Base64 sin prefijo `data:`; se omite si vacía), cantidad y subcategoriaId (0 si no hay).
 * Los campos marcados como "sólo front" no existen en el back (se ignoran al enviarlos).
 */
export interface Producto {
  productoId?: number;
  nombre: string;
  calorias?: number | null;
  descripcion?: string;
  precio: number;
  estadoProducto?: estadoProducto;
  imagen?: string;
  /** Sólo front: el back nunca lo devuelve ni lo lee (usa `imagen`). */
  imagenBase64?: string;
  cantidad: number;
  /** Sólo front: nombre de la categoría seleccionada en el formulario. */
  categoria?: string;
  /** Sólo front: nombre de la subcategoría seleccionada en el formulario. */
  subcategoria?: string;
  subcategoriaId?: number;
  /** Sólo front: observaciones del cliente para este producto. */
  observaciones?: string;
}

/** Query de GET /productos (nombres exactos que lee el back). */
export interface ProductoListParams {
  /** Incluir la imagen Base64 en cada producto (por defecto false en el back). */
  includeImage?: boolean;
  /** Sólo productos DISPONIBLES (por defecto false en el back). */
  onlyActive?: boolean;
}

export interface DetallesProducto {
  cantidad: number;
  nombre: string;
  precioUnitario: number;
  productoId: number;
  subtotal: number;
}
