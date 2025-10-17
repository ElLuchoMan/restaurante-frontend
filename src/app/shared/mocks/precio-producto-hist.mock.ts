import { ApiResponse } from '../models/api-response.model';
import { PrecioProductoHist } from '../models/precio-producto-hist.model';

export const mockPrecioProductoHistList: ApiResponse<PrecioProductoHist[]> = {
  code: 200,
  message: 'Historial obtenido',
  data: [
    {
      precioHistId: 1,
      productoId: 1,
      nombre: 'Coca Cola 500ml',
      precio: 2000,
      fechaVigencia: '2024-01-01',
      estadoProducto: 'DISPONIBLE',
    },
    {
      precioHistId: 2,
      productoId: 1,
      nombre: 'Coca Cola 500ml',
      precio: 2100,
      fechaVigencia: '2024-02-01',
      estadoProducto: 'DISPONIBLE',
    },
    {
      precioHistId: 3,
      productoId: 2,
      nombre: 'Pepsi 500ml',
      precio: 1800,
      fechaVigencia: '2024-01-01',
      estadoProducto: 'DISPONIBLE',
    },
  ],
};

export const mockPrecioProductoHistById: ApiResponse<PrecioProductoHist> = {
  code: 200,
  message: 'Registro encontrado',
  data: {
    precioHistId: 1,
    productoId: 1,
    nombre: 'Coca Cola 500ml',
    precio: 2000,
    fechaVigencia: '2024-01-01',
    estadoProducto: 'DISPONIBLE',
  },
};
