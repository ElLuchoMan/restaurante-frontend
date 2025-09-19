import { ApiResponse } from '../models/api-response.model';
import {
  DashboardData,
  SalesData,
  ProductsData,
  UsersData,
  TimeAnalysisData,
  RentabilidadData,
  SegmentacionData,
  EficienciaData,
  ReservasAnalisisData,
  PedidosAnalisisData,
} from '../models/telemetry.model';

export const mockDashboardData: ApiResponse<DashboardData> = {
  code: 200,
  message: 'Dashboard obtenido exitosamente',
  data: {
    totalPedidos: 1250,
    ingresosTotales: 45750000.5,
    usuariosRegistrados: 320,
    valorPromedioOrden: 36600.4,
  },
};

export const mockSalesData: ApiResponse<SalesData> = {
  code: 200,
  message: 'Análisis de ventas obtenido exitosamente',
  data: {
    pedidosPorMetodoPago: [
      { metodoPago: 'EFECTIVO', cantidad: 450, porcentaje: 36.0 },
      { metodoPago: 'TARJETA', cantidad: 520, porcentaje: 41.6 },
      { metodoPago: 'TRANSFERENCIA', cantidad: 280, porcentaje: 22.4 },
    ],
    ingresosPorMetodoPago: [
      { metodoPago: 'EFECTIVO', ingresos: 16470000.0, porcentaje: 36.0 },
      { metodoPago: 'TARJETA', ingresos: 19032000.0, porcentaje: 41.6 },
      { metodoPago: 'TRANSFERENCIA', ingresos: 10248000.0, porcentaje: 22.4 },
    ],
    tendenciasVentas: [
      { fecha: '2024-01-01', ventas: 1250000.5, pedidos: 45 },
      { fecha: '2024-01-02', ventas: 980000.25, pedidos: 38 },
      { fecha: '2024-01-03', ventas: 1450000.75, pedidos: 52 },
    ],
  },
};

export const mockProductsData: ApiResponse<ProductsData> = {
  code: 200,
  message: 'Análisis de productos obtenido exitosamente',
  data: {
    productosMasVendidos: [
      { nombreProducto: 'Bandeja Paisa', cantidadVendida: 145, ingresosTotales: 5220000.0 },
      { nombreProducto: 'Sancocho de Gallina', cantidadVendida: 128, ingresosTotales: 4480000.0 },
      { nombreProducto: 'Ajiaco Santafereño', cantidadVendida: 98, ingresosTotales: 3430000.0 },
    ],
    productosMenosVendidos: [
      { nombreProducto: 'Cazuela de Mariscos', cantidadVendida: 12, ingresosTotales: 600000.0 },
      { nombreProducto: 'Churrasco Premium', cantidadVendida: 18, ingresosTotales: 1080000.0 },
      { nombreProducto: 'Paella Valenciana', cantidadVendida: 25, ingresosTotales: 1375000.0 },
    ],
    frecuenciaProductos: [
      { nombreProducto: 'Bandeja Paisa', frecuencia: 11.6 },
      { nombreProducto: 'Sancocho de Gallina', frecuencia: 10.2 },
      { nombreProducto: 'Ajiaco Santafereño', frecuencia: 7.8 },
    ],
  },
};

export const mockUsersData: ApiResponse<UsersData> = {
  code: 200,
  message: 'Análisis de usuarios obtenido exitosamente',
  data: {
    usuariosFrecuentes: [
      {
        nombreUsuario: 'María González',
        documento: 1015466494,
        cantidadPedidos: 28,
        totalGastado: 1260000.0,
      },
      {
        nombreUsuario: 'Carlos Rodríguez',
        documento: 1023456789,
        cantidadPedidos: 24,
        totalGastado: 1080000.0,
      },
      {
        nombreUsuario: 'Ana Martínez',
        documento: 1034567890,
        cantidadPedidos: 21,
        totalGastado: 945000.0,
      },
    ],
    usuariosInactivos: [
      {
        nombreUsuario: 'Pedro Sánchez',
        documento: 1045678901,
        cantidadPedidos: 1,
        totalGastado: 45000.0,
      },
      {
        nombreUsuario: 'Laura López',
        documento: 1056789012,
        cantidadPedidos: 2,
        totalGastado: 78000.0,
      },
    ],
    totalGastadoPorUsuario: [
      { nombreUsuario: 'María González', documento: 1015466494, totalGastado: 1260000.0 },
      { nombreUsuario: 'Carlos Rodríguez', documento: 1023456789, totalGastado: 1080000.0 },
    ],
    fechaUltimoPedido: [
      {
        nombreUsuario: 'María González',
        documento: 1015466494,
        fechaUltimoPedido: '2024-01-15T14:30:00Z',
      },
      {
        nombreUsuario: 'Carlos Rodríguez',
        documento: 1023456789,
        fechaUltimoPedido: '2024-01-14T19:45:00Z',
      },
    ],
  },
};

export const mockTimeAnalysisData: ApiResponse<TimeAnalysisData> = {
  code: 200,
  message: 'Análisis temporal obtenido exitosamente',
  data: {
    pedidosPorHora: [
      { hora: 12, cantidadPedidos: 145, porcentaje: 11.6 },
      { hora: 13, cantidadPedidos: 168, porcentaje: 13.4 },
      { hora: 19, cantidadPedidos: 192, porcentaje: 15.4 },
    ],
    pedidosPorDiaSemana: [
      { diaSemana: 'Viernes', cantidadPedidos: 245, porcentaje: 19.6 },
      { diaSemana: 'Sábado', cantidadPedidos: 268, porcentaje: 21.4 },
      { diaSemana: 'Domingo', cantidadPedidos: 198, porcentaje: 15.8 },
    ],
    ventasPorMes: [
      { mes: 'Enero', ventas: 12450000.5, pedidos: 456 },
      { mes: 'Febrero', ventas: 11280000.25, pedidos: 412 },
      { mes: 'Marzo', ventas: 13670000.75, pedidos: 498 },
    ],
  },
};

export const mockRentabilidadData: ApiResponse<RentabilidadData> = {
  code: 200,
  message: 'Análisis de rentabilidad obtenido exitosamente',
  data: {
    productosMasRentables: [
      {
        nombreProducto: 'Bandeja Paisa',
        margenBruto: 65.5,
        ingresosTotales: 5220000.0,
        cantidadVendida: 145,
      },
      {
        nombreProducto: 'Sancocho de Gallina',
        margenBruto: 58.2,
        ingresosTotales: 4480000.0,
        cantidadVendida: 128,
      },
    ],
    productosMenosRentables: [
      {
        nombreProducto: 'Cazuela de Mariscos',
        margenBruto: 25.8,
        ingresosTotales: 600000.0,
        cantidadVendida: 12,
      },
      {
        nombreProducto: 'Churrasco Premium',
        margenBruto: 32.1,
        ingresosTotales: 1080000.0,
        cantidadVendida: 18,
      },
    ],
    estadisticas: {
      margenPromedioGeneral: 52.3,
      ingresosTotales: 45750000.5,
      totalProductosAnalizados: 85,
    },
  },
};

export const mockSegmentacionData: ApiResponse<SegmentacionData> = {
  code: 200,
  message: 'Segmentación de clientes obtenida exitosamente',
  data: {
    clientesVIP: [
      {
        nombreCliente: 'María González',
        documento: 1015466494,
        totalGastado: 1260000.0,
        cantidadPedidos: 28,
        valorPromedio: 45000.0,
      },
      {
        nombreCliente: 'Carlos Rodríguez',
        documento: 1023456789,
        totalGastado: 1080000.0,
        cantidadPedidos: 24,
        valorPromedio: 45000.0,
      },
    ],
    clientesRegulares: [
      {
        nombreCliente: 'Ana Martínez',
        documento: 1034567890,
        totalGastado: 945000.0,
        cantidadPedidos: 21,
        valorPromedio: 45000.0,
      },
      {
        nombreCliente: 'Luis Hernández',
        documento: 1045678901,
        totalGastado: 720000.0,
        cantidadPedidos: 16,
        valorPromedio: 45000.0,
      },
    ],
    clientesNuevos: [
      {
        nombreCliente: 'Pedro Sánchez',
        documento: 1056789012,
        totalGastado: 135000.0,
        cantidadPedidos: 3,
        valorPromedio: 45000.0,
      },
      {
        nombreCliente: 'Laura López',
        documento: 1067890123,
        totalGastado: 90000.0,
        cantidadPedidos: 2,
        valorPromedio: 45000.0,
      },
    ],
    estadisticas: {
      totalClientesVIP: 15,
      totalClientesRegulares: 85,
      totalClientesNuevos: 220,
      valorPromedioVIP: 1125000.0,
      valorPromedioRegular: 485000.0,
      valorPromedioNuevo: 112500.0,
    },
  },
};

export const mockEficienciaData: ApiResponse<EficienciaData> = {
  code: 200,
  message: 'Análisis de eficiencia obtenido exitosamente',
  data: {
    tiemposEntrega: [
      { fecha: '2024-01-15', tiempoPromedioMinutos: 35.5, pedidosEntregados: 45 },
      { fecha: '2024-01-14', tiempoPromedioMinutos: 42.3, pedidosEntregados: 38 },
      { fecha: '2024-01-13', tiempoPromedioMinutos: 28.7, pedidosEntregados: 52 },
    ],
    rendimientoTrabajadores: [
      {
        nombreTrabajador: 'Juan Pérez',
        documento: 1098765432,
        pedidosEntregados: 156,
        tiempoPromedioMinutos: 32.5,
        eficiencia: 92.3,
      },
      {
        nombreTrabajador: 'Ana García',
        documento: 1087654321,
        pedidosEntregados: 142,
        tiempoPromedioMinutos: 35.8,
        eficiencia: 88.7,
      },
    ],
    eficienciaPorHora: [
      { hora: 12, pedidosCompletados: 25, pedidosPendientes: 3, eficiencia: 89.3 },
      { hora: 13, pedidosCompletados: 32, pedidosPendientes: 5, eficiencia: 86.5 },
      { hora: 19, pedidosCompletados: 28, pedidosPendientes: 4, eficiencia: 87.5 },
    ],
    estadisticas: {
      tiempoPromedioGeneral: 34.2,
      eficienciaPromedio: 88.5,
      totalPedidosAnalizados: 1250,
      trabajadoresActivos: 8,
    },
  },
};

export const mockReservasAnalisisData: ApiResponse<ReservasAnalisisData> = {
  code: 200,
  message: 'Análisis de reservas obtenido exitosamente',
  data: {
    reservasPorDia: [
      { fecha: '2024-01-15', reservasCompletadas: 28, porcentaje: 8.5 },
      { fecha: '2024-01-14', reservasCompletadas: 32, porcentaje: 9.7 },
      { fecha: '2024-01-13', reservasCompletadas: 25, porcentaje: 7.6 },
    ],
    reservasPorHora: [
      { hora: 12, reservasCompletadas: 45, porcentaje: 13.6 },
      { hora: 13, reservasCompletadas: 52, porcentaje: 15.8 },
      { hora: 19, reservasCompletadas: 68, porcentaje: 20.6 },
    ],
    reservasPorDiaSemana: [
      { diaSemana: 'Viernes', reservasCompletadas: 58, porcentaje: 17.6 },
      { diaSemana: 'Sábado', reservasCompletadas: 72, porcentaje: 21.8 },
      { diaSemana: 'Domingo', reservasCompletadas: 45, porcentaje: 13.6 },
    ],
    estadisticas: {
      totalReservasCompletadas: 330,
      promedioReservasDiarias: 11.0,
      horaPico: 19,
      diaPico: 'Sábado',
    },
  },
};

export const mockPedidosAnalisisData: ApiResponse<PedidosAnalisisData> = {
  code: 200,
  message: 'Análisis de pedidos obtenido exitosamente',
  data: {
    pedidosPorDia: [
      { fecha: '2024-01-15', pedidosCompletados: 45, porcentaje: 3.6 },
      { fecha: '2024-01-14', pedidosCompletados: 52, porcentaje: 4.2 },
      { fecha: '2024-01-13', pedidosCompletados: 38, porcentaje: 3.0 },
    ],
    pedidosPorHora: [
      { hora: 12, pedidosCompletados: 145, porcentaje: 11.6 },
      { hora: 13, pedidosCompletados: 168, porcentaje: 13.4 },
      { hora: 19, pedidosCompletados: 192, porcentaje: 15.4 },
    ],
    pedidosPorDiaSemana: [
      { diaSemana: 'Viernes', pedidosCompletados: 245, porcentaje: 19.6 },
      { diaSemana: 'Sábado', pedidosCompletados: 268, porcentaje: 21.4 },
      { diaSemana: 'Domingo', pedidosCompletados: 198, porcentaje: 15.8 },
    ],
    estadisticas: {
      totalPedidosCompletados: 1250,
      promedioPedidosDiarios: 41.7,
      horaPico: 19,
      diaPico: 'Sábado',
    },
  },
};

// Mock de error para testing
export const mockTelemetryErrorResponse = {
  code: 500,
  message: 'Error interno del servidor',
  cause: 'Error de conexión a la base de datos',
};

// Función helper para simular delay de red
export const mockTelemetryDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));
