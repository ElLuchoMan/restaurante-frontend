import { ApiResponse } from '../models/api-response.model';
import { AplicarDescuentoResponse, PedidoDescuentoAplicado } from '../models/descuento.model';

export const mockPedidoDescuento: PedidoDescuentoAplicado = {
  pedidoDescuentoId: 1,
  pedidoId: { pedidoId: 1 },
  cuponId: { cuponId: 1 },
  montoDescuento: 2000,
  detalle: {
    tipo: 'cupon',
    codigo: 'BIENVENIDA10',
    scope: 'GLOBAL',
  },
  createdAt: '15-01-2025 14:30:00',
};

/** Respuesta de POST /descuentos/pedidos: descuento + importes recalculados por el servidor. */
export const mockDescuentoAplicado: ApiResponse<AplicarDescuentoResponse> = {
  code: 201,
  message: 'Descuento aplicado exitosamente',
  data: {
    descuento: mockPedidoDescuento,
    subtotal: 20000,
    montoDescuento: 2000,
    total: 18000,
    pagoId: 4,
  },
};
