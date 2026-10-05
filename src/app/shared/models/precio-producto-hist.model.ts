/**
 * Fila de GET /precio_producto_hist (y /search). El back sólo devuelve nombre, estadoProducto,
 * precio y fechaVigencia (ver controllers/precioproductohist).
 */
export interface PrecioProductoHist {
  /** El back NO lo devuelve actualmente. */
  precioHistId?: number;
  /** El back NO lo devuelve actualmente. */
  productoId?: number;
  nombre: string;
  precio: number;
  /** Formato de respuesta `DD-MM-YYYY` (el filtro `fecha` de la petición es `YYYY-MM-DD`). */
  fechaVigencia: string;
  estadoProducto: string;
}
