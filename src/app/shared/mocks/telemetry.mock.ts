import { ApiResponse } from '../models/api-response.model';
import {
  DashboardData,
  EficienciaData,
  PedidosAnalisisData,
  ProductosPopularesData,
  ProductsData,
  RentabilidadData,
  ReservasAnalisisData,
  SalesData,
  SegmentacionData,
  TimeAnalysisData,
  UsersData,
} from '../models/telemetry.model';

export const mockDashboardData: ApiResponse<DashboardData> = {
  code: 200,
  message: 'Dashboard obtenido exitosamente',
  data: {
    totalPedidos: 1250,
    totalIngresos: 45750000,
    totalUsuarios: 320, // Usuarios activos en el período filtrado
    promedioVentaPedido: 36600.4,
    pedidosHoy: 45,
    ingresosHoy: 1650000,
  },
};

export const mockSalesData: ApiResponse<SalesData> = {
  code: 200,
  message: 'Análisis de ventas obtenido exitosamente',
  data: {
    ventasPorMetodoPago: [
      { metodoPago: 'EFECTIVO', total: 16470000, cantidad: 450 },
      { metodoPago: 'TARJETA', total: 19032000, cantidad: 520 },
      { metodoPago: 'TRANSFERENCIA', total: 10248000, cantidad: 280 },
    ],
    tendenciaVentas: [
      { fecha: '2024-01-01', total: 1250000, cantidad: 45 },
      { fecha: '2024-01-02', total: 980000, cantidad: 38 },
      { fecha: '2024-01-03', total: 1450000, cantidad: 52 },
    ],
    estadisticasGenerales: {
      ventaPromedioDiaria: 1226666.67,
      pedidoPromedioDiario: 44.33,
      ticketPromedio: 27666.67,
    },
  },
};

export const mockProductsData: ApiResponse<ProductsData> = {
  code: 200,
  message: 'Análisis de productos obtenido exitosamente',
  data: {
    productosMasVendidos: [
      {
        productoId: 1,
        nombreProducto: 'Bandeja Paisa',
        cantidadVendida: 145,
        ingresoTotal: 5220000,
        precio: 36000,
        imagen: 'assets/img/portfolio-1.webp',
      },
      {
        productoId: 2,
        nombreProducto: 'Sancocho de Gallina',
        cantidadVendida: 128,
        ingresoTotal: 4480000,
        precio: 35000,
        imagen: 'assets/img/portfolio-1.webp',
      },
      {
        productoId: 3,
        nombreProducto: 'Ajiaco Santafereño',
        cantidadVendida: 98,
        ingresoTotal: 3430000,
        precio: 35000,
        imagen: 'assets/img/portfolio-1.webp',
      },
    ],
    productosMenosVendidos: [
      {
        productoId: 4,
        nombreProducto: 'Cazuela de Mariscos',
        cantidadVendida: 12,
        ingresoTotal: 600000,
        precio: 50000,
        imagen: 'assets/img/portfolio-1.webp',
      },
      {
        productoId: 5,
        nombreProducto: 'Churrasco Premium',
        cantidadVendida: 18,
        ingresoTotal: 1080000,
        precio: 60000,
        imagen: 'assets/img/portfolio-1.webp',
      },
      {
        productoId: 6,
        nombreProducto: 'Paella Valenciana',
        cantidadVendida: 25,
        ingresoTotal: 1375000,
        precio: 55000,
        imagen: 'assets/img/portfolio-1.webp',
      },
    ],
    estadisticasProductos: {
      totalProductosActivos: 85,
      productoConMasVentas: 'Bandeja Paisa',
      productoConMenosVentas: 'Cazuela de Mariscos',
    },
  },
};

export const mockUsersData: ApiResponse<UsersData> = {
  code: 200,
  message: 'Análisis de usuarios obtenido exitosamente',
  data: {
    usuariosFrecuentes: [
      {
        documentoCliente: 1015466494,
        nombreCompleto: 'María González',
        totalPedidos: 28,
        totalGastado: 1260000,
        ultimoPedido: '2024-01-15T14:30:00Z',
      },
      {
        documentoCliente: 1023456789,
        nombreCompleto: 'Carlos Rodríguez',
        totalPedidos: 24,
        totalGastado: 1080000,
        ultimoPedido: '2024-01-14T19:45:00Z',
      },
      {
        documentoCliente: 1034567890,
        nombreCompleto: 'Ana Martínez',
        totalPedidos: 21,
        totalGastado: 945000,
        ultimoPedido: '2024-01-13T12:15:00Z',
      },
    ],
    usuariosInactivos: [
      {
        documentoCliente: 1045678901,
        nombreCompleto: 'Pedro Sánchez',
        totalPedidos: 1,
        ultimoPedido: '2023-12-01T10:30:00Z',
      },
      {
        documentoCliente: 1056789012,
        nombreCompleto: 'Laura López',
        totalPedidos: 2,
        ultimoPedido: '2023-11-15T16:45:00Z',
      },
    ],
    estadisticasUsuarios: {
      totalClientes: 320,
      clientesActivos: 285,
      clientesInactivos: 35,
      promedioGastoPorCliente: 156250.0,
    },
  },
};

export const mockTimeAnalysisData: ApiResponse<TimeAnalysisData> = {
  code: 200,
  message: 'Análisis temporal obtenido exitosamente',
  data: {
    ventasPorHora: [
      { hora: 12, total: 5220000, cantidad: 145 },
      { hora: 13, total: 6048000, cantidad: 168 },
      { hora: 19, total: 6912000, cantidad: 192 },
    ],
    ventasPorDiaSemana: [
      { diaSemana: 'Viernes', total: 8820000, cantidad: 245 },
      { diaSemana: 'Sábado', total: 9648000, cantidad: 268 },
      { diaSemana: 'Domingo', total: 7128000, cantidad: 198 },
    ],
    ventasPorMes: [
      { mes: 'Enero', total: 12450000, cantidad: 456 },
      { mes: 'Febrero', total: 11280000, cantidad: 412 },
      { mes: 'Marzo', total: 13670000, cantidad: 498 },
    ],
  },
};

export const mockRentabilidadData: ApiResponse<RentabilidadData> = {
  code: 200,
  message: 'Análisis de rentabilidad obtenido exitosamente',
  data: {
    productosRentables: [
      {
        productoId: 1,
        nombreProducto: 'Bandeja Paisa',
        precioVenta: 36000,
        cantidadVendida: 145,
        ingresoTotal: 5220000,
        margenGanancia: 65.5,
        gananciaTotal: 3419000,
      },
      {
        productoId: 2,
        nombreProducto: 'Sancocho de Gallina',
        precioVenta: 35000,
        cantidadVendida: 128,
        ingresoTotal: 4480000,
        margenGanancia: 58.2,
        gananciaTotal: 2607360,
      },
    ],
    productosMenosRentables: [
      {
        productoId: 4,
        nombreProducto: 'Cazuela de Mariscos',
        precioVenta: 50000,
        cantidadVendida: 12,
        ingresoTotal: 600000,
        margenGanancia: 25.8,
        gananciaTotal: 154800,
      },
      {
        productoId: 5,
        nombreProducto: 'Churrasco Premium',
        precioVenta: 60000,
        cantidadVendida: 18,
        ingresoTotal: 1080000,
        margenGanancia: 32.1,
        gananciaTotal: 346680,
      },
    ],
    estadisticasRentabilidad: {
      margenPromedioGeneral: 52.3,
      productoMasRentable: 'Bandeja Paisa',
      productoMenosRentable: 'Cazuela de Mariscos',
      totalGanancias: 23887500,
      totalIngresos: 45750000,
    },
  },
};

export const mockSegmentacionData: ApiResponse<SegmentacionData> = {
  code: 200,
  message: 'Segmentación de clientes obtenida exitosamente',
  data: {
    clientesVIP: [
      {
        documentoCliente: 1015466494,
        nombreCompleto: 'María González',
        totalPedidos: 28,
        totalGastado: 1260000,
        promedioGasto: 45000,
        ultimoPedido: '2024-01-15T14:30:00Z',
        diasSinPedir: 2,
        segmento: 'VIP',
        valorVida: 2520000,
      },
      {
        documentoCliente: 1023456789,
        nombreCompleto: 'Carlos Rodríguez',
        totalPedidos: 24,
        totalGastado: 1080000,
        promedioGasto: 45000,
        ultimoPedido: '2024-01-14T19:45:00Z',
        diasSinPedir: 3,
        segmento: 'VIP',
        valorVida: 2160000,
      },
    ],
    clientesRegulares: [
      {
        documentoCliente: 1034567890,
        nombreCompleto: 'Ana Martínez',
        totalPedidos: 21,
        totalGastado: 945000,
        promedioGasto: 45000,
        ultimoPedido: '2024-01-13T12:15:00Z',
        diasSinPedir: 4,
        segmento: 'Regular',
        valorVida: 1890000,
      },
      {
        documentoCliente: 1045678901,
        nombreCompleto: 'Luis Hernández',
        totalPedidos: 16,
        totalGastado: 720000,
        promedioGasto: 45000,
        ultimoPedido: '2024-01-12T18:20:00Z',
        diasSinPedir: 5,
        segmento: 'Regular',
        valorVida: 1440000,
      },
    ],
    clientesOcasionales: [
      {
        documentoCliente: 1056789012,
        nombreCompleto: 'Pedro Sánchez',
        totalPedidos: 8,
        totalGastado: 360000,
        promedioGasto: 45000,
        ultimoPedido: '2024-01-10T15:30:00Z',
        diasSinPedir: 7,
        segmento: 'Ocasional',
        valorVida: 720000,
      },
    ],
    clientesNuevos: [
      {
        documentoCliente: 1067890123,
        nombreCompleto: 'Laura López',
        totalPedidos: 2,
        totalGastado: 90000,
        promedioGasto: 45000,
        ultimoPedido: '2024-01-16T11:45:00Z',
        diasSinPedir: 1,
        segmento: 'Nuevo',
        valorVida: 180000,
      },
    ],
    estadisticasSegmentacion: {
      totalClientesVIP: 15,
      totalClientesRegulares: 85,
      totalClientesOcasionales: 120,
      totalClientesNuevos: 100,
      promedioGastoVIP: 1125000,
      promedioGastoRegular: 485000,
      porcentajeVIP: 4.69,
    },
  },
};

export const mockEficienciaData: ApiResponse<EficienciaData> = {
  code: 200,
  message: 'Análisis de eficiencia obtenido exitosamente',
  data: {
    tiemposEntrega: [
      {
        pedidoId: 1001,
        cliente: 'María González',
        fechaPedido: '2024-01-15',
        horaPedido: '14:30:00',
        tiempoPreparacion: 35,
        estadoPedido: 'ENTREGADO',
        trabajadorAsignado: 'Juan Pérez',
      },
      {
        pedidoId: 1002,
        cliente: 'Carlos Rodríguez',
        fechaPedido: '2024-01-14',
        horaPedido: '19:45:00',
        tiempoPreparacion: 42,
        estadoPedido: 'ENTREGADO',
        trabajadorAsignado: 'Ana García',
      },
      {
        pedidoId: 1003,
        cliente: 'Ana Martínez',
        fechaPedido: '2024-01-13',
        horaPedido: '12:15:00',
        tiempoPreparacion: 28,
        estadoPedido: 'ENTREGADO',
        trabajadorAsignado: 'Juan Pérez',
      },
    ],
    rendimientoTrabajadores: [
      {
        documentoTrabajador: 1098765432,
        nombreTrabajador: 'Juan Pérez',
        pedidosAtendidos: 156,
        tiempoPromedioAtencion: 32.5,
        eficienciaScore: 9.2,
        horasTrabajadas: 160.0,
      },
      {
        documentoTrabajador: 1087654321,
        nombreTrabajador: 'Ana García',
        pedidosAtendidos: 142,
        tiempoPromedioAtencion: 35.8,
        eficienciaScore: 8.8,
        horasTrabajadas: 155.0,
      },
    ],
    analisisPorHora: [
      {
        hora: '12:00',
        pedidosRecibidos: 25,
        tiempoPromedioPrep: 30.5,
        capacidadUtilizada: 89.3,
        nivelEficiencia: 'Alto',
      },
      {
        hora: '13:00',
        pedidosRecibidos: 32,
        tiempoPromedioPrep: 33.2,
        capacidadUtilizada: 86.5,
        nivelEficiencia: 'Alto',
      },
      {
        hora: '19:00',
        pedidosRecibidos: 28,
        tiempoPromedioPrep: 35.1,
        capacidadUtilizada: 87.5,
        nivelEficiencia: 'Alto',
      },
    ],
    estadisticasEficiencia: {
      tiempoPromedioGeneral: 34.2,
      horaMasEficiente: '12:00',
      horaMenosEficiente: '19:00',
      trabajadorMasEficiente: 'Juan Pérez',
      capacidadPromedioUso: 87.8,
      pedidosPendientes: 12,
    },
  },
};

export const mockReservasAnalisisData: ApiResponse<ReservasAnalisisData> = {
  code: 200,
  message: 'Análisis de reservas obtenido exitosamente',
  data: {
    reservasPorDia: [
      {
        fecha: '2024-01-15',
        totalReservas: 35,
        reservasCompletadas: 28,
        totalPersonas: 112,
        porcentajeCompletado: 80.0,
      },
      {
        fecha: '2024-01-14',
        totalReservas: 40,
        reservasCompletadas: 32,
        totalPersonas: 128,
        porcentajeCompletado: 80.0,
      },
      {
        fecha: '2024-01-13',
        totalReservas: 30,
        reservasCompletadas: 25,
        totalPersonas: 100,
        porcentajeCompletado: 83.3,
      },
    ],
    reservasPorHora: [
      {
        hora: '12:00',
        totalReservas: 56,
        reservasCompletadas: 45,
        totalPersonas: 180,
        porcentajeCompletado: 80.4,
      },
      {
        hora: '13:00',
        totalReservas: 65,
        reservasCompletadas: 52,
        totalPersonas: 208,
        porcentajeCompletado: 80.0,
      },
      {
        hora: '19:00',
        totalReservas: 85,
        reservasCompletadas: 68,
        totalPersonas: 272,
        porcentajeCompletado: 80.0,
      },
    ],
    reservasPorDiaSemana: [
      {
        diaSemana: 'Viernes',
        totalReservas: 72,
        reservasCompletadas: 58,
        totalPersonas: 232,
        porcentajeCompletado: 80.6,
      },
      {
        diaSemana: 'Sábado',
        totalReservas: 90,
        reservasCompletadas: 72,
        totalPersonas: 288,
        porcentajeCompletado: 80.0,
      },
      {
        diaSemana: 'Domingo',
        totalReservas: 56,
        reservasCompletadas: 45,
        totalPersonas: 180,
        porcentajeCompletado: 80.4,
      },
    ],
    estadisticasReservas: {
      totalReservasCompletadas: 330,
      diaMasReservas: 'Sábado',
      horaMasReservas: '19:00',
      promedioPersonasPorReserva: 4.0,
      tasaCompletamiento: 80.5,
    },
  },
};

export const mockPedidosAnalisisData: ApiResponse<PedidosAnalisisData> = {
  code: 200,
  message: 'Análisis de pedidos obtenido exitosamente',
  data: {
    pedidosPorDia: [
      {
        fecha: '2024-01-15',
        totalPedidos: 50,
        pedidosTerminados: 45,
        ingresoTotal: 1620000,
        tasaCompletamiento: 90.0,
      },
      {
        fecha: '2024-01-14',
        totalPedidos: 58,
        pedidosTerminados: 52,
        ingresoTotal: 1872000,
        tasaCompletamiento: 89.7,
      },
      {
        fecha: '2024-01-13',
        totalPedidos: 42,
        pedidosTerminados: 38,
        ingresoTotal: 1368000,
        tasaCompletamiento: 90.5,
      },
    ],
    pedidosPorHora: [
      {
        hora: '12:00',
        totalPedidos: 160,
        pedidosTerminados: 145,
        ingresoTotal: 5220000,
        tasaCompletamiento: 90.6,
      },
      {
        hora: '13:00',
        totalPedidos: 186,
        pedidosTerminados: 168,
        ingresoTotal: 6048000,
        tasaCompletamiento: 90.3,
      },
      {
        hora: '19:00',
        totalPedidos: 213,
        pedidosTerminados: 192,
        ingresoTotal: 6912000,
        tasaCompletamiento: 90.1,
      },
    ],
    pedidosPorDiaSemana: [
      {
        diaSemana: 'Viernes',
        totalPedidos: 272,
        pedidosTerminados: 245,
        ingresoTotal: 8820000,
        tasaCompletamiento: 90.1,
      },
      {
        diaSemana: 'Sábado',
        totalPedidos: 298,
        pedidosTerminados: 268,
        ingresoTotal: 9648000,
        tasaCompletamiento: 89.9,
      },
      {
        diaSemana: 'Domingo',
        totalPedidos: 220,
        pedidosTerminados: 198,
        ingresoTotal: 7128000,
        tasaCompletamiento: 90.0,
      },
    ],
    estadisticasPedidos: {
      totalPedidosTerminados: 1250,
      diaMasPedidos: 'Sábado',
      horaMasPedidos: '19:00',
      ingresoPromedioHora: 191600.0,
      tasaCompletamientoGeneral: 90.1,
    },
  },
};

// Mock para productos populares (endpoint público)
export const mockProductosPopularesData: ApiResponse<ProductosPopularesData> = {
  code: 200,
  message: 'Productos populares (ultimo_mes) obtenidos exitosamente',
  data: {
    productosPopulares: [
      {
        productoId: 1,
        nombreProducto: 'Bandeja Paisa',
        cantidadVendida: 145,
        ingresoTotal: 5220000,
        precio: 36000,
        imagen: 'assets/img/product-1.webp',
      },
      {
        productoId: 2,
        nombreProducto: 'Sancocho de Gallina',
        cantidadVendida: 128,
        ingresoTotal: 4480000,
        precio: 35000,
        imagen: 'assets/img/product-2.webp',
      },
      {
        productoId: 3,
        nombreProducto: 'Ajiaco Santafereño',
        cantidadVendida: 98,
        ingresoTotal: 3430000,
        precio: 35000,
        imagen: 'assets/img/product-3.webp',
      },
      {
        productoId: 4,
        nombreProducto: 'Arroz con Pollo',
        cantidadVendida: 87,
        ingresoTotal: 2610000,
        precio: 30000,
        imagen: 'assets/img/product-4.webp',
      },
    ],
  },
};

// **🆕 MOCKS PARA LOS 5 NUEVOS DASHBOARDS**

export const mockRentabilidadData: ApiResponse<RentabilidadData> = {
  code: 200,
  message: 'Análisis de rentabilidad obtenido exitosamente',
  data: {
    productosRentables: [
      {
        productoId: 1,
        nombreProducto: 'Bandeja Paisa',
        precioVenta: 36000,
        cantidadVendida: 145,
        ingresoTotal: 5220000,
        margenGanancia: 65.5,
        gananciaTotal: 3419000,
      },
      {
        productoId: 2,
        nombreProducto: 'Sancocho de Gallina',
        precioVenta: 35000,
        cantidadVendida: 128,
        ingresoTotal: 4480000,
        margenGanancia: 58.2,
        gananciaTotal: 2607360,
      },
      {
        productoId: 3,
        nombreProducto: 'Ajiaco Santafereño',
        precioVenta: 35000,
        cantidadVendida: 98,
        ingresoTotal: 3430000,
        margenGanancia: 62.1,
        gananciaTotal: 2130030,
      },
    ],
    productosMenosRentables: [
      {
        productoId: 4,
        nombreProducto: 'Cazuela de Mariscos',
        precioVenta: 50000,
        cantidadVendida: 12,
        ingresoTotal: 600000,
        margenGanancia: 25.8,
        gananciaTotal: 154800,
      },
      {
        productoId: 5,
        nombreProducto: 'Churrasco Premium',
        precioVenta: 60000,
        cantidadVendida: 18,
        ingresoTotal: 1080000,
        margenGanancia: 32.1,
        gananciaTotal: 346680,
      },
    ],
    estadisticasRentabilidad: {
      margenPromedioGeneral: 52.3,
      productoMasRentable: 'Bandeja Paisa',
      productoMenosRentable: 'Cazuela de Mariscos',
      totalGanancias: 23887500,
      totalIngresos: 45750000,
    },
  },
};

export const mockSegmentacionData: ApiResponse<SegmentacionData> = {
  code: 200,
  message: 'Segmentación de clientes obtenida exitosamente',
  data: {
    clientesVIP: [
      {
        documentoCliente: 1015466494,
        nombreCompleto: 'María González',
        totalPedidos: 28,
        totalGastado: 1260000,
        promedioGasto: 45000.0,
        ultimoPedido: '2024-01-15T14:30:00Z',
        diasSinPedir: 2,
        segmento: 'VIP',
        valorVida: 2520000,
      },
      {
        documentoCliente: 1023456789,
        nombreCompleto: 'Carlos Rodríguez',
        totalPedidos: 24,
        totalGastado: 1080000,
        promedioGasto: 45000.0,
        ultimoPedido: '2024-01-14T19:45:00Z',
        diasSinPedir: 3,
        segmento: 'VIP',
        valorVida: 2160000,
      },
    ],
    clientesRegulares: [
      {
        documentoCliente: 1034567890,
        nombreCompleto: 'Ana Martínez',
        totalPedidos: 21,
        totalGastado: 945000,
        promedioGasto: 45000.0,
        ultimoPedido: '2024-01-13T12:15:00Z',
        diasSinPedir: 4,
        segmento: 'Regular',
        valorVida: 1890000,
      },
      {
        documentoCliente: 1045678901,
        nombreCompleto: 'Luis Hernández',
        totalPedidos: 16,
        totalGastado: 720000,
        promedioGasto: 45000.0,
        ultimoPedido: '2024-01-12T18:20:00Z',
        diasSinPedir: 5,
        segmento: 'Regular',
        valorVida: 1440000,
      },
    ],
    clientesOcasionales: [
      {
        documentoCliente: 1056789012,
        nombreCompleto: 'Pedro Sánchez',
        totalPedidos: 8,
        totalGastado: 360000,
        promedioGasto: 45000.0,
        ultimoPedido: '2024-01-10T15:30:00Z',
        diasSinPedir: 7,
        segmento: 'Ocasional',
        valorVida: 720000,
      },
    ],
    clientesNuevos: [
      {
        documentoCliente: 1067890123,
        nombreCompleto: 'Laura López',
        totalPedidos: 2,
        totalGastado: 90000,
        promedioGasto: 45000.0,
        ultimoPedido: '2024-01-16T11:45:00Z',
        diasSinPedir: 1,
        segmento: 'Nuevo',
        valorVida: 180000,
      },
    ],
    estadisticasSegmentacion: {
      totalClientesVIP: 15,
      totalClientesRegulares: 85,
      totalClientesOcasionales: 120,
      totalClientesNuevos: 100,
      promedioGastoVIP: 1125000.0,
      promedioGastoRegular: 485000.0,
      porcentajeVIP: 4.69,
    },
  },
};

export const mockEficienciaData: ApiResponse<EficienciaData> = {
  code: 200,
  message: 'Análisis de eficiencia obtenido exitosamente',
  data: {
    tiemposEntrega: [
      {
        pedidoId: 1001,
        cliente: 'María González',
        fechaPedido: '2024-01-15',
        horaPedido: '14:30:00',
        tiempoPreparacion: 35,
        estadoPedido: 'ENTREGADO',
        trabajadorAsignado: 'Juan Pérez',
      },
      {
        pedidoId: 1002,
        cliente: 'Carlos Rodríguez',
        fechaPedido: '2024-01-14',
        horaPedido: '19:45:00',
        tiempoPreparacion: 42,
        estadoPedido: 'ENTREGADO',
        trabajadorAsignado: 'Ana García',
      },
      {
        pedidoId: 1003,
        cliente: 'Ana Martínez',
        fechaPedido: '2024-01-13',
        horaPedido: '12:15:00',
        tiempoPreparacion: 28,
        estadoPedido: 'ENTREGADO',
        trabajadorAsignado: 'Juan Pérez',
      },
    ],
    rendimientoTrabajadores: [
      {
        documentoTrabajador: 1098765432,
        nombreTrabajador: 'Juan Pérez',
        pedidosAtendidos: 156,
        tiempoPromedioAtencion: 32.5,
        eficienciaScore: 9.2,
        horasTrabajadas: 160.0,
      },
      {
        documentoTrabajador: 1087654321,
        nombreTrabajador: 'Ana García',
        pedidosAtendidos: 142,
        tiempoPromedioAtencion: 35.8,
        eficienciaScore: 8.8,
        horasTrabajadas: 155.0,
      },
    ],
    analisisPorHora: [
      {
        hora: '12:00',
        pedidosRecibidos: 25,
        tiempoPromedioPrep: 30.5,
        capacidadUtilizada: 89.3,
        nivelEficiencia: 'Alto',
      },
      {
        hora: '13:00',
        pedidosRecibidos: 32,
        tiempoPromedioPrep: 33.2,
        capacidadUtilizada: 86.5,
        nivelEficiencia: 'Alto',
      },
      {
        hora: '19:00',
        pedidosRecibidos: 28,
        tiempoPromedioPrep: 35.1,
        capacidadUtilizada: 87.5,
        nivelEficiencia: 'Alto',
      },
    ],
    estadisticasEficiencia: {
      tiempoPromedioGeneral: 34.2,
      horaMasEficiente: '12:00',
      horaMenosEficiente: '19:00',
      trabajadorMasEficiente: 'Juan Pérez',
      capacidadPromedioUso: 87.8,
      pedidosPendientes: 12,
    },
  },
};

export const mockReservasAnalisisData: ApiResponse<ReservasAnalisisData> = {
  code: 200,
  message: 'Análisis de reservas obtenido exitosamente',
  data: {
    reservasPorDia: [
      {
        fecha: '2024-01-15',
        totalReservas: 35,
        reservasCompletadas: 28,
        totalPersonas: 112,
        porcentajeCompletado: 80.0,
      },
      {
        fecha: '2024-01-14',
        totalReservas: 40,
        reservasCompletadas: 32,
        totalPersonas: 128,
        porcentajeCompletado: 80.0,
      },
      {
        fecha: '2024-01-13',
        totalReservas: 30,
        reservasCompletadas: 25,
        totalPersonas: 100,
        porcentajeCompletado: 83.3,
      },
    ],
    reservasPorHora: [
      {
        hora: '12:00',
        totalReservas: 56,
        reservasCompletadas: 45,
        totalPersonas: 180,
        porcentajeCompletado: 80.4,
      },
      {
        hora: '13:00',
        totalReservas: 65,
        reservasCompletadas: 52,
        totalPersonas: 208,
        porcentajeCompletado: 80.0,
      },
      {
        hora: '19:00',
        totalReservas: 85,
        reservasCompletadas: 68,
        totalPersonas: 272,
        porcentajeCompletado: 80.0,
      },
    ],
    reservasPorDiaSemana: [
      {
        diaSemana: 'Viernes',
        totalReservas: 72,
        reservasCompletadas: 58,
        totalPersonas: 232,
        porcentajeCompletado: 80.6,
      },
      {
        diaSemana: 'Sábado',
        totalReservas: 90,
        reservasCompletadas: 72,
        totalPersonas: 288,
        porcentajeCompletado: 80.0,
      },
      {
        diaSemana: 'Domingo',
        totalReservas: 56,
        reservasCompletadas: 45,
        totalPersonas: 180,
        porcentajeCompletado: 80.4,
      },
    ],
    estadisticasReservas: {
      totalReservasCompletadas: 330,
      diaMasReservas: 'Sábado',
      horaMasReservas: '19:00',
      promedioPersonasPorReserva: 4.0,
      tasaCompletamiento: 80.5,
    },
  },
};

export const mockPedidosAnalisisData: ApiResponse<PedidosAnalisisData> = {
  code: 200,
  message: 'Análisis de pedidos obtenido exitosamente',
  data: {
    pedidosPorDia: [
      {
        fecha: '2024-01-15',
        totalPedidos: 50,
        pedidosTerminados: 45,
        ingresoTotal: 1620000,
        tasaCompletamiento: 90.0,
      },
      {
        fecha: '2024-01-14',
        totalPedidos: 58,
        pedidosTerminados: 52,
        ingresoTotal: 1872000,
        tasaCompletamiento: 89.7,
      },
      {
        fecha: '2024-01-13',
        totalPedidos: 42,
        pedidosTerminados: 38,
        ingresoTotal: 1368000,
        tasaCompletamiento: 90.5,
      },
    ],
    pedidosPorHora: [
      {
        hora: '12:00',
        totalPedidos: 160,
        pedidosTerminados: 145,
        ingresoTotal: 5220000,
        tasaCompletamiento: 90.6,
      },
      {
        hora: '13:00',
        totalPedidos: 186,
        pedidosTerminados: 168,
        ingresoTotal: 6048000,
        tasaCompletamiento: 90.3,
      },
      {
        hora: '19:00',
        totalPedidos: 213,
        pedidosTerminados: 192,
        ingresoTotal: 6912000,
        tasaCompletamiento: 90.1,
      },
    ],
    pedidosPorDiaSemana: [
      {
        diaSemana: 'Viernes',
        totalPedidos: 272,
        pedidosTerminados: 245,
        ingresoTotal: 8820000,
        tasaCompletamiento: 90.1,
      },
      {
        diaSemana: 'Sábado',
        totalPedidos: 298,
        pedidosTerminados: 268,
        ingresoTotal: 9648000,
        tasaCompletamiento: 89.9,
      },
      {
        diaSemana: 'Domingo',
        totalPedidos: 220,
        pedidosTerminados: 198,
        ingresoTotal: 7128000,
        tasaCompletamiento: 90.0,
      },
    ],
    estadisticasPedidos: {
      totalPedidosTerminados: 1250,
      diaMasPedidos: 'Sábado',
      horaMasPedidos: '19:00',
      ingresoPromedioHora: 191600.0,
      tasaCompletamientoGeneral: 90.1,
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
