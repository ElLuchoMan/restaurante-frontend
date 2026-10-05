export type TimePeriod =
  | 'hoy'
  | 'ultima_semana'
  | 'ultimo_mes'
  | 'ultimos_3_meses'
  | 'ultimos_6_meses'
  | 'ultimo_año'
  | 'historico';

// NOTA: el backend (Go/beego) devuelve `null` en vez de `[]` para las listas cuando la consulta
// no trae filas (slice nil), por eso todas las listas de las respuestas son `T[] | null`.

// Dashboard Types
export interface DashboardData {
  totalPedidos: number;
  totalIngresos: number;
  totalUsuarios: number; // Usuarios activos en el período filtrado
  promedioVentaPedido: number;
  pedidosHoy: number;
  ingresosHoy: number;
}

// Sales Types
export interface VentaPorMetodo {
  metodoPago: string;
  total: number;
  cantidad: number;
}

export interface VentaPorFecha {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface EstadisticasVentas {
  ventaPromedioDiaria: number;
  pedidoPromedioDiario: number;
  ticketPromedio: number;
}

export interface SalesData {
  ventasPorMetodoPago: VentaPorMetodo[] | null;
  tendenciaVentas: VentaPorFecha[] | null;
  estadisticasGenerales: EstadisticasVentas;
}

// Products Types
export interface ProductoVendido {
  productoId: number;
  nombreProducto: string;
  cantidadVendida: number;
  ingresoTotal: number;
  precio: number;
  imagen: string; // Base64 encoded image
}

export interface EstadisticasProductos {
  totalProductosActivos: number;
  productoConMasVentas: string;
  productoConMenosVentas: string;
}

export interface ProductsData {
  productosMasVendidos: ProductoVendido[] | null;
  productosMenosVendidos: ProductoVendido[] | null;
  estadisticasProductos: EstadisticasProductos;
}

// Productos Populares Types (Endpoint Público)
export interface ProductosPopularesData {
  productosPopulares: ProductoVendido[] | null;
}

// Users Types
export interface UsuarioFrecuente {
  documentoCliente: number;
  nombreCompleto: string;
  totalPedidos: number;
  totalGastado: number;
  ultimoPedido: string;
}

export interface UsuarioInactivo {
  documentoCliente: number;
  nombreCompleto: string;
  totalPedidos: number;
  ultimoPedido: string;
}

export interface EstadisticasUsuarios {
  totalClientes: number;
  clientesActivos: number;
  clientesInactivos: number;
  promedioGastoPorCliente: number;
}

export interface UsersData {
  usuariosFrecuentes: UsuarioFrecuente[] | null;
  usuariosInactivos: UsuarioInactivo[] | null;
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
  ventasPorHora: VentaPorHora[] | null;
  ventasPorDiaSemana: VentaPorDiaSemana[] | null;
  ventasPorMes: VentaPorMes[] | null;
}

// Rentabilidad Types
export interface ProductoRentabilidad {
  productoId: number;
  nombreProducto: string;
  precioVenta: number;
  cantidadVendida: number;
  ingresoTotal: number;
  margenGanancia: number;
  gananciaTotal: number;
}

export interface EstadisticasRentabilidad {
  margenPromedioGeneral: number;
  productoMasRentable: string;
  productoMenosRentable: string;
  totalGanancias: number;
  totalIngresos: number;
}

export interface RentabilidadData {
  productosRentables: ProductoRentabilidad[] | null;
  productosMenosRentables: ProductoRentabilidad[] | null;
  estadisticasRentabilidad: EstadisticasRentabilidad;
}

// Segmentación Types
export interface ClienteSegmento {
  documentoCliente: number;
  nombreCompleto: string;
  totalPedidos: number;
  totalGastado: number;
  promedioGasto: number;
  ultimoPedido: string;
  diasSinPedir: number;
  segmento: string;
  valorVida: number;
}

export interface EstadisticasSegmentacion {
  totalClientesVIP: number;
  totalClientesRegulares: number;
  totalClientesOcasionales: number;
  totalClientesNuevos: number;
  promedioGastoVIP: number;
  promedioGastoRegular: number;
  porcentajeVIP: number;
}

export interface SegmentacionData {
  clientesVIP: ClienteSegmento[] | null;
  clientesRegulares: ClienteSegmento[] | null;
  clientesOcasionales: ClienteSegmento[] | null;
  clientesNuevos: ClienteSegmento[] | null;
  estadisticasSegmentacion: EstadisticasSegmentacion;
}

// Eficiencia Types
export interface TiempoEntrega {
  pedidoId: number;
  cliente: string;
  fechaPedido: string;
  horaPedido: string;
  tiempoPreparacion: number;
  estadoPedido: string;
  trabajadorAsignado: string;
}

export interface RendimientoTrabajador {
  documentoTrabajador: number;
  nombreTrabajador: string;
  pedidosAtendidos: number;
  tiempoPromedioAtencion: number;
  eficienciaScore: number;
  horasTrabajadas: number;
}

export interface EficienciaPorHora {
  hora: string;
  pedidosRecibidos: number;
  tiempoPromedioPrep: number;
  capacidadUtilizada: number;
  nivelEficiencia: string;
}

export interface EstadisticasEficiencia {
  tiempoPromedioGeneral: number;
  horaMasEficiente: string;
  horaMenosEficiente: string;
  trabajadorMasEficiente: string;
  capacidadPromedioUso: number;
  pedidosPendientes: number;
}

export interface EficienciaData {
  tiemposEntrega: TiempoEntrega[] | null;
  rendimientoTrabajadores: RendimientoTrabajador[] | null;
  analisisPorHora: EficienciaPorHora[] | null;
  estadisticasEficiencia: EstadisticasEficiencia;
}

// Reservas Analysis Types
export interface ReservaPorDia {
  fecha: string;
  totalReservas: number;
  reservasCompletadas: number;
  totalPersonas: number;
  porcentajeCompletado: number;
}

export interface ReservaPorHora {
  hora: string;
  totalReservas: number;
  reservasCompletadas: number;
  totalPersonas: number;
  porcentajeCompletado: number;
}

export interface ReservaPorDiaSemana {
  diaSemana: string;
  totalReservas: number;
  reservasCompletadas: number;
  totalPersonas: number;
  porcentajeCompletado: number;
}

export interface EstadisticasReservas {
  totalReservasCompletadas: number;
  diaMasReservas: string;
  horaMasReservas: string;
  promedioPersonasPorReserva: number;
  tasaCompletamiento: number;
}

export interface ReservasAnalisisData {
  reservasPorDia: ReservaPorDia[] | null;
  reservasPorHora: ReservaPorHora[] | null;
  reservasPorDiaSemana: ReservaPorDiaSemana[] | null;
  estadisticasReservas: EstadisticasReservas;
}

// Pedidos Analysis Types
export interface PedidoPorDia {
  fecha: string;
  totalPedidos: number;
  pedidosTerminados: number;
  ingresoTotal: number;
  tasaCompletamiento: number;
}

export interface PedidoPorHora {
  hora: string;
  totalPedidos: number;
  pedidosTerminados: number;
  ingresoTotal: number;
  tasaCompletamiento: number;
}

export interface PedidoPorDiaSemana {
  diaSemana: string;
  totalPedidos: number;
  pedidosTerminados: number;
  ingresoTotal: number;
  tasaCompletamiento: number;
}

export interface EstadisticasPedidos {
  totalPedidosTerminados: number;
  diaMasPedidos: string;
  horaMasPedidos: string;
  ingresoPromedioHora: number;
  tasaCompletamientoGeneral: number;
}

export interface PedidosAnalisisData {
  pedidosPorDia: PedidoPorDia[] | null;
  pedidosPorHora: PedidoPorHora[] | null;
  pedidosPorDiaSemana: PedidoPorDiaSemana[] | null;
  estadisticasPedidos: EstadisticasPedidos;
}

// Endpoints públicos (sin token)
/** GET /estados-pedidos: conteo por estado + clave sintética NO_FINALIZADOS. */
export type EstadosPedidosData = Record<string, number>;

/** GET /productos-disponibles: `data` es un array (null si no hay productos). */
export interface ProductoDisponible {
  productoId: number;
  nombreProducto: string;
  precio: number;
  estado: string;
  totalVendido: number;
}

// Service Parameters - Filtros Temporales Avanzados
export interface TelemetryParams {
  // Filtros predefinidos
  periodo?: TimePeriod;
  limit?: number;

  // Filtros por mes y año
  mes?: number; // 1-12
  año?: number; // ej: 2024

  // Filtros por rango de fechas
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string; // YYYY-MM-DD

  // Filtros por horas
  hora_inicio?: string; // HH:MM:SS
  hora_fin?: string; // HH:MM:SS
}

// ========================================
// LOCAL TELEMETRY TYPES (for service internal use)
// ========================================

export type DeviceType = 'desktop' | 'web-mobile' | 'android' | 'ios';

export interface TelemetryEvent {
  id: string;
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'purchase' | 'http_request' | 'error';
  timestamp: number;
  userId?: number | null;
  userDocument?: string | null;
  deviceType?: DeviceType;
  currentScreen?: string | null;
  message?: string;
  stack?: string;
  handled?: boolean;
  requestId?: string;
  method?: string;
  url?: string;
  ok?: boolean;
  status?: number;
  durationMs?: number;
  paymentMethodId?: number;
  paymentMethodLabel?: string;
  requiresDelivery?: boolean;
  items?: PurchaseItem[];
  subtotal?: number;
}

export interface PurchaseItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseData {
  userId: number | null;
  paymentMethodId: number;
  paymentMethodLabel: string;
  requiresDelivery: boolean;
  items: PurchaseItem[];
  subtotal: number;
}

export interface AggregatedMetrics {
  login: {
    attempts: number;
    successes: number;
    failures: number;
  };
  purchasesByPaymentMethod: Record<string, number>;
  productsCount: Record<string, number>;
  usersByPurchases: Record<string, number>;
  salesByHour: Record<string, number>;
  salesByWeekday: Record<string, number>;
}
