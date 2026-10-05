import { ApiResponse } from '../models/api-response.model';
import { PedidoDescuentoAplicado } from '../models/descuento.model';

export const mockDescuentoAplicado: ApiResponse<PedidoDescuentoAplicado> = {
  code: 200,
  message: 'Descuento aplicado exitosamente',
  data: {
    pedidoDescuentoId: 1,
    pedidoId: 1,
    cuponId: 1,
    ofertaId: null,
    montoDescuento: 2000,
    detalle: {
      fuente: 'CUPON',
      codigo: 'BIENVENIDA10',
      tipo: 'PORCENTAJE',
      valor: 10,
    },
    createdAt: '2025-01-15T14:30:00Z',
  },
};
