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
  ingresosHoy: number;
  pedidosHoy: number;
  promedioVentaPedido: number;
  totalIngresos: number;
  totalPedidos: number;
  totalUsuarios: number;
}

// Sales Types
export interface VentaPorMetodoPago {
  metodoPago: string;
  total: number;
  cantidad: number;
}

export interface TendenciaVenta {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface EstadisticasGenerales {
  pedidoPromedioDiario: number;
  ticketPromedio: number;
  ventaPromedioDiaria: number;
}

export interface SalesData {
  ventasPorMetodoPago: VentaPorMetodoPago[];
  tendenciaVentas: TendenciaVenta[];
  estadisticasGenerales: EstadisticasGenerales;
}

// Products Types
export interface ProductoTelemetria {
  productoId: number;
  nombreProducto: string;
  cantidadVendida: number;
  ingresoTotal: number;
  precio: number;
}

export interface EstadisticasProductos {
  productoConMasVentas: string;
  productoConMenosVentas: string;
  totalProductosActivos: number;
}

export interface ProductsData {
  productosMasVendidos: ProductoTelemetria[];
  productosMenosVendidos: ProductoTelemetria[];
  estadisticasProductos: EstadisticasProductos;
}

// Users Types
export interface UsuarioTelemetria {
  documentoCliente: number;
  nombreCompleto: string;
  totalPedidos: number;
  totalGastado: number;
  ultimoPedido: string;
}

export interface EstadisticasUsuarios {
  clientesActivos: number;
  clientesInactivos: number;
  promedioGastoPorCliente: number;
  totalClientes: number;
}

export interface UsersData {
  usuariosFrecuentes: UsuarioTelemetria[] | null;
  usuariosInactivos: UsuarioTelemetria[];
  estadisticasUsuarios: EstadisticasUsuarios;
}

// Time Analysis Types
export interface VentaPorHora {
  hora: number;
  total: number;
  cantidad: number;
}

export interface VentaPorDiaSemana {
  diaSemana: string;
  total: number;
  cantidad: number;
}

export interface VentaPorMes {
  mes: string;
  total: number;
  cantidad: number;
}

export interface TimeAnalysisData {
  ventasPorHora: VentaPorHora[];
  ventasPorDiaSemana: VentaPorDiaSemana[];
  ventasPorMes: VentaPorMes[];
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
