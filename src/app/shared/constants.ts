// Enums sincronizados desde Swagger (valores y nombres idénticos)
export enum DiaSemana {
  DiaLunes = 'Lunes',
  DiaMartes = 'Martes',
  DiaMiercoles = 'Miércoles',
  DiaJueves = 'Jueves',
  DiaViernes = 'Viernes',
  DiaSabado = 'Sábado',
  DiaDomingo = 'Domingo',
}

export enum EstadoPedido {
  EstadoPedidoIniciado = 'INICIADO',
  EstadoPedidoEnPreparacion = 'EN_PREPARACION',
  EstadoPedidoListo = 'LISTO',
  EstadoPedidoTerminado = 'TERMINADO',
  EstadoPedidoCancelado = 'CANCELADO',
}

export enum RolTrabajador {
  RolAdministrador = 'Administrador',
  RolMesero = 'Mesero',
  RolCocinero = 'Cocinero',
  RolDomiciliario = 'Domiciliario',
  RolOficiosVarios = 'Oficios_varios',
}
export enum estadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  CUMPLIDA = 'CUMPLIDA',
}

export enum estadoNomina {
  PAGO = 'PAGO',
  NO_PAGO = 'NO_PAGO',
}
export enum estadoPago {
  PAGADO = 'PAGADO',
  PENDIENTE = 'PENDIENTE',
  NO_PAGADO = 'NO_PAGO',
}
export enum estadoDomicilio {
  PENDIENTE = 'PENDIENTE',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
}
export enum estadoProducto {
  DISPONIBLE = 'DISPONIBLE',
  NO_DISPONIBLE = 'NO_DISPONIBLE',
}
export const metodoPago = {
  Nequi: { metodoPagoId: 1, tipo: 'Nequi', detalle: '3042449339' },
  Daviplata: { metodoPagoId: 2, tipo: 'Daviplata', detalle: '3042449339' },
  Efectivo: { metodoPagoId: 3, tipo: 'Efectivo', detalle: '3042449339' },
  Tarjeta: { metodoPagoId: 4, tipo: 'Tarjeta', detalle: 'N/A' },
} as const;
