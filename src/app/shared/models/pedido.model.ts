import { EstadoPedido } from '../constants';
import { Cliente } from './cliente.model';
import { Domicilio } from './domicilio.model';
import { Pago } from './pago.model';
import { Restaurante } from './restaurante.model';

/**
 * Pedido tal como lo devuelve el back (`GET/POST /pedidos` y respuestas de asignar-*).
 * - `fechaPedido` llega como DD-MM-YYYY, `horaPedido` como HH:MM:SS y `updatedAt` como
 *   DD-MM-YYYY HH:mm:ss.
 * - Las relaciones (`pagoId`, `domicilioId`, `restauranteId`, `documentoCliente`) NO llegan como
 *   número: el back serializa el modelo relacionado como objeto en el que solo el id es fiable.
 *   Son `null` si el pedido no tiene la relación y `domicilioId` se omite.
 */
export interface Pedido {
  pedidoId: number;
  fechaPedido: string;
  horaPedido: string;
  delivery: boolean;
  estadoPedido: EstadoPedido;
  domicilioId?: Pick<Domicilio, 'domicilioId'>;
  pagoId: Pick<Pago, 'pagoId'> | null;
  restauranteId: Pick<Restaurante, 'restauranteId'> | null;
  documentoCliente: Pick<Cliente, 'documentoCliente'> | null;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Cuerpo de POST /pedidos. El back fuerza fecha, hora y estado INICIADO. Con `delivery: true`
 * `pk_id_domicilio` es obligatorio (si no, responde 400).
 */
export interface PedidoCreate {
  delivery: boolean;
  restauranteId?: number;
  documentoCliente?: number;
  pk_id_domicilio?: number;
}

/** Filtros de GET /pedidos. `desde` y `hasta` solo se aplican juntos. Fechas en YYYY-MM-DD. */
export interface PedidoListParams {
  fecha?: string;
  desde?: string;
  hasta?: string;
  mes?: number;
  anio?: number;
  cliente?: number;
  /** Tipo del método de pago (comparación sin distinguir mayúsculas). */
  metodo_pago?: string;
  domicilio?: boolean;
}

/** Elemento del JSON de `PedidoDetalle.productos`. */
export interface PedidoDetalleProducto {
  pk_id_producto: number;
  nombre: string;
  cantidad: number;
  /** Precio unitario. */
  precio: number;
  subtotal: number;
}

/**
 * `data` de GET /pedidos/detalles. A diferencia de `Pedido`, aquí `fechaPedido` llega como
 * YYYY-MM-DD y las relaciones llegan como número (0 cuando no existen). `productos` es un
 * string con un JSON de `PedidoDetalleProducto[]`.
 */
export interface PedidoDetalle {
  pedidoId: number;
  fechaPedido: string;
  horaPedido: string;
  delivery: boolean;
  estadoPedido: EstadoPedido;
  metodoPago: string;
  productos: string;
  pagoId: number;
  metodoPagoId: number;
  domicilioId: number;
  documentoCliente: number;
}
