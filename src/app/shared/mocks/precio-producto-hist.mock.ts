import { ApiResponse } from '../models/api-response.model';
import { PrecioProductoHist } from '../models/precio-producto-hist.model';

export const mockPrecioProductoHistList: ApiResponse<PrecioProductoHist[]> = {
  code: 200,
  message: 'Historial obtenido',
  data: [
    { productoId: 1, precio: 2000, fechaVigencia: '2024-01-01' },
    { productoId: 1, precio: 2100, fechaVigencia: '2024-02-01' },
    { productoId: 1, precio: 2200, fechaVigencia: '2024-03-01' },
  ],
};

export const mockPrecioProductoHistById: ApiResponse<PrecioProductoHist> = {
  code: 200,
  message: 'Registro encontrado',
  data: { productoId: 1, precio: 2000, fechaVigencia: '2024-01-01' },
};
