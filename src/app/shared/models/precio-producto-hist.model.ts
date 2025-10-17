export interface PrecioProductoHist {
  precioHistId?: number;
  productoId: number;
  nombre?: string;
  precio: number;
  fechaVigencia: string;
  estadoProducto?: string;
}
