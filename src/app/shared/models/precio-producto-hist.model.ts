/**
 * Fila de GET /precio_producto_hist (y /search): `models.PrecioHistItemDoc` del back.
 */
export interface PrecioProductoHist {
  precioHistId: number;
  productoId: number;
  nombre: string;
  precio: number;
  /** Formato de respuesta `DD-MM-YYYY` (el filtro `fecha` de la petición es `YYYY-MM-DD`). */
  fechaVigencia: string;
  estadoProducto: string;
}
