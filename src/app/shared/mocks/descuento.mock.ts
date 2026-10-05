import { ApiResponse } from '../models/api-response.model';
import { PedidoDescuentoAplicado } from '../models/descuento.model';

export const mockDescuentoAplicado: ApiResponse<PedidoDescuentoAplicado> = {
  code: 201,
  message: 'Descuento aplicado exitosamente',
  data: {
    pedidoDescuentoId: 1,
    pedidoId: { pedidoId: 1 },
    cuponId: { cuponId: 1 },
    montoDescuento: 2000,
    detalle: {
      fuente: 'CUPON',
      codigo: 'BIENVENIDA10',
      tipo: 'PORCENTAJE',
      valor: 10,
    },
    createdAt: '15-01-2025 14:30:00',
  },
};
