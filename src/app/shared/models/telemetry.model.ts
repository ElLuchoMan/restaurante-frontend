export type TimePeriod =
  | 'hoy'
  | 'ultima_semana'
  | 'ultimo_mes'
  | 'ultimos_3_meses'
  | 'ultimos_6_meses'
  | 'ultimo_año'
  | 'historico';

// Dashboard Types
export interface DashboardData {
  totalPedidos: number;
  ingresosTotales: number;
  usuariosRegistrados: number;
  valorPromedioOrden: number;
}

// Sales Types
export interface MetodoPagoStats {
  metodoPago: string;
  cantidad?: number;
  ingresos?: number;
  porcentaje: number;
}

export interface TendenciaVenta {
  fecha: string;
  ventas: number;
  pedidos: number;
}

export interface SalesData {
  pedidosPorMetodoPago: MetodoPagoStats[];
  ingresosPorMetodoPago: MetodoPagoStats[];
  tendenciasVentas: TendenciaVenta[];
}

// Products Types
export interface ProductoVenta {
  nombreProducto: string;
  cantidadVendida: number;
  ingresosTotales: number;
}

export interface ProductoFrecuencia {
  nombreProducto: string;
  frecuencia: number;
}

export interface ProductsData {
  productosMasVendidos: ProductoVenta[];
  productosMenosVendidos: ProductoVenta[];
  frecuenciaProductos: ProductoFrecuencia[];
}

// Users Types
export interface UsuarioStats {
  nombreUsuario: string;
  documento: number;
  cantidadPedidos: number;
  totalGastado: number;
}

export interface UsuarioUltimoPedido {
  nombreUsuario: string;
  documento: number;
  fechaUltimoPedido: string;
}

export interface UsersData {
  usuariosFrecuentes: UsuarioStats[];
  usuariosInactivos: UsuarioStats[];
  totalGastadoPorUsuario: UsuarioStats[];
  fechaUltimoPedido: UsuarioUltimoPedido[];
}

// Time Analysis Types
export interface PedidosPorHora {
  hora: number;
  cantidadPedidos: number;
  porcentaje: number;
}

export interface PedidosPorDia {
  diaSemana: string;
  cantidadPedidos: number;
  porcentaje: number;
}

export interface VentasPorMes {
  mes: string;
  ventas: number;
  pedidos: number;
}

export interface TimeAnalysisData {
  pedidosPorHora: PedidosPorHora[];
  pedidosPorDiaSemana: PedidosPorDia[];
  ventasPorMes: VentasPorMes[];
}

// Rentabilidad Types
export interface ProductoRentabilidad {
  nombreProducto: string;
  margenBruto: number;
  ingresosTotales: number;
  cantidadVendida: number;
}

export interface EstadisticasRentabilidad {
  margenPromedioGeneral: number;
  ingresosTotales: number;
  totalProductosAnalizados: number;
}

export interface RentabilidadData {
  productosMasRentables: ProductoRentabilidad[];
  productosMenosRentables: ProductoRentabilidad[];
  estadisticas: EstadisticasRentabilidad;
}

// Segmentación Types
export interface ClienteSegmento {
  nombreCliente: string;
  documento: number;
  totalGastado: number;
  cantidadPedidos: number;
  valorPromedio: number;
}

export interface EstadisticasSegmentacion {
  totalClientesVIP: number;
  totalClientesRegulares: number;
  totalClientesNuevos: number;
  valorPromedioVIP: number;
  valorPromedioRegular: number;
  valorPromedioNuevo: number;
}

export interface SegmentacionData {
  clientesVIP: ClienteSegmento[];
  clientesRegulares: ClienteSegmento[];
  clientesNuevos: ClienteSegmento[];
  estadisticas: EstadisticasSegmentacion;
}

// Eficiencia Types
export interface TiempoEntrega {
  fecha: string;
  tiempoPromedioMinutos: number;
  pedidosEntregados: number;
}

export interface RendimientoTrabajador {
  nombreTrabajador: string;
  documento: number;
  pedidosEntregados: number;
  tiempoPromedioMinutos: number;
  eficiencia: number;
}

export interface EficienciaPorHora {
  hora: number;
  pedidosCompletados: number;
  pedidosPendientes: number;
  eficiencia: number;
}

export interface EstadisticasEficiencia {
  tiempoPromedioGeneral: number;
  eficienciaPromedio: number;
  totalPedidosAnalizados: number;
  trabajadoresActivos: number;
}

export interface EficienciaData {
  tiemposEntrega: TiempoEntrega[];
  rendimientoTrabajadores: RendimientoTrabajador[];
  eficienciaPorHora: EficienciaPorHora[];
  estadisticas: EstadisticasEficiencia;
}

// Reservas Analysis Types
export interface ReservaPorDia {
  fecha: string;
  reservasCompletadas: number;
  porcentaje: number;
}

export interface ReservaPorHora {
  hora: number;
  reservasCompletadas: number;
  porcentaje: number;
}

export interface ReservaPorDiaSemana {
  diaSemana: string;
  reservasCompletadas: number;
  porcentaje: number;
}

export interface EstadisticasReservas {
  totalReservasCompletadas: number;
  promedioReservasDiarias: number;
  horaPico: number;
  diaPico: string;
}

export interface ReservasAnalisisData {
  reservasPorDia: ReservaPorDia[];
  reservasPorHora: ReservaPorHora[];
  reservasPorDiaSemana: ReservaPorDiaSemana[];
  estadisticas: EstadisticasReservas;
}

// Pedidos Analysis Types
export interface PedidoPorDia {
  fecha: string;
  pedidosCompletados: number;
  porcentaje: number;
}

export interface PedidoPorHora {
  hora: number;
  pedidosCompletados: number;
  porcentaje: number;
}

export interface PedidoPorDiaSemana {
  diaSemana: string;
  pedidosCompletados: number;
  porcentaje: number;
}

export interface EstadisticasPedidos {
  totalPedidosCompletados: number;
  promedioPedidosDiarios: number;
  horaPico: number;
  diaPico: string;
}

export interface PedidosAnalisisData {
  pedidosPorDia: PedidoPorDia[];
  pedidosPorHora: PedidoPorHora[];
  pedidosPorDiaSemana: PedidoPorDiaSemana[];
  estadisticas: EstadisticasPedidos;
}

// Service Parameters
export interface TelemetryParams {
  periodo?: TimePeriod;
  limit?: number;
}
