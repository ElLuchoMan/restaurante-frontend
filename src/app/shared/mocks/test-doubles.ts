import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

export function createRequestPermissionMock() {
  return jest.fn().mockResolvedValue('granted');
}

export function createRequestPermissionDeniedMock() {
  return jest.fn().mockResolvedValue('denied');
}

export function createAlertSpyMock() {
  return jest.spyOn(window, 'alert').mockImplementation(() => {});
}

export function createServiceWorkerMock() {
  return {
    controller: {},
    ready: Promise.resolve({
      showNotification: jest.fn(),
    }),
  };
}

export function createNotificationMock() {
  return jest.fn();
}

export function createCapacitorMock() {
  return {
    getPlatform: jest.fn().mockReturnValue('android'),
  };
}

export function createHorarioTrabajadorServiceMock() {
  return {
    create: jest.fn().mockReturnValue(of({ code: 201, message: 'Horario creado', data: {} })),
    update: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(),
    getByTrabajador: jest.fn(),
    crearHorariosTrabajador: jest.fn().mockResolvedValue(undefined),
  } as any;
}

export function createSwPushMock() {
  return {
    requestSubscription: jest.fn(),
    unsubscribe: jest.fn(),
    messages: of({}),
    isEnabled: true,
  } as any;
}

export function createSwUpdateMock() {
  return {
    available: of({}),
    activated: of({}),
    checkForUpdate: jest.fn(),
    activateUpdate: jest.fn(),
  } as any;
}

export function createWebPushServiceMock() {
  return {
    isSupported: jest.fn(),
    getPermissionStatus: jest.fn(),
    requestPermission: jest.fn(),
    subscribeToNotifications: jest.fn(),
  } as any;
}

export function createModalServiceMock() {
  return {
    openModal: jest.fn(),
    closeModal: jest.fn(),
    getModalData: jest.fn(),
    modalData$: new BehaviorSubject<any>(null).asObservable(),
    isOpen$: new BehaviorSubject<boolean>(false).asObservable(),
  } as any;
}

export function createRouterMock(): jest.Mocked<Router> {
  return { navigate: jest.fn(), navigateByUrl: jest.fn() } as unknown as jest.Mocked<Router>;
}

export function createRouterWithEventsMock(events$: any, url = '/'): jest.Mocked<Router> {
  return {
    navigate: jest.fn(),
    navigateByUrl: jest.fn(),
    events: events$,
    url,
  } as unknown as jest.Mocked<Router>;
}

export function createToastrMock() {
  return { success: jest.fn(), error: jest.fn(), warning: jest.fn(), clear: jest.fn() } as any;
}

export function createLiveAnnouncerServiceMock() {
  return {
    announce: jest.fn(),
  } as any;
}

export function createUserServiceMock() {
  return {
    getAuthState: jest.fn(),
    getUserRole: jest.fn(),
    logout: jest.fn(),
    getUserId: jest.fn(),
    getTrabajadorId: jest.fn(),
    getClienteId: jest.fn(),
    decodeToken: jest.fn(),
    validateTokenAndLogout: jest.fn(),
    isLoggedIn: jest.fn(),
    isTokenExpired: jest.fn(),
    login: jest.fn(),
    saveToken: jest.fn(),
    saveTokens: jest.fn(),
    setRemember: jest.fn(),
    getToken: jest.fn(),
    getRefreshToken: jest.fn(),
    refreshTokens: jest.fn(),
    attemptTokenRefresh: jest.fn(),
  } as any;
}

export function createProductoServiceMock() {
  return {
    getProductos: jest.fn(),
    createProducto: jest.fn(),
    getProductoById: jest.fn(),
    updateProducto: jest.fn(),
  } as any;
}

export function createCartServiceMock() {
  return {
    items$: new BehaviorSubject<any[]>([]),
    addToCart: jest.fn(),
    changeQty: jest.fn(),
    remove: jest.fn(),
    clearCart: jest.fn(),
  } as any;
}

export function createMetodosPagoServiceMock(resp: any = { data: [] }) {
  return { getAll: jest.fn().mockReturnValue(of(resp)) } as any;
}

export function createDomicilioServiceMock() {
  return {
    createDomicilio: jest.fn(),
    updateDomicilio: jest.fn(),
    getDomicilios: jest.fn(),
    asignarDomiciliario: jest.fn(),
    getDomicilioById: jest.fn().mockReturnValue(
      of({
        data: { pedido: { productos: [], total: 0 }, cliente: { nombre: 'N', apellido: 'A' } },
      }),
    ),
  } as any;
}

export function createPedidoServiceMock() {
  return {
    createPedido: jest.fn(),
    assignPago: jest.fn(),
    assignDomicilio: jest.fn(),
    getMisPedidos: jest.fn(),
    getPedidoDetalles: jest.fn(),
  } as any;
}

export function createPagoServiceMock(resp: any = { data: { pagoId: 1 } }) {
  return {
    createPago: jest.fn().mockReturnValue(of(resp)),
  } as any;
}

export function createProductoPedidoServiceMock() {
  return { create: jest.fn() } as any;
}

// PedidoClienteService se eliminó; no se requiere este mock

export function createClienteServiceMock() {
  return {
    getClienteId: jest.fn(),
    getClientes: jest.fn(),
    registroCliente: jest.fn(),
    actualizarCliente: jest.fn(),
    eliminarCliente: jest.fn(),
  } as any;
}

export function createDomSanitizerMock(): Partial<DomSanitizer> {
  return {
    bypassSecurityTrustResourceUrl: jest.fn((url: string) => {
      return {
        toString: () => url,
        changingThisBreaksApplicationSecurity: url,
      } as unknown as SafeResourceUrl;
    }),
    sanitize: jest.fn((context: any, value: SafeResourceUrl) => {
      return (value as any).toString();
    }),
  } as any;
}

export function createFullDomSanitizerMock(): Partial<DomSanitizer> {
  return {
    bypassSecurityTrustHtml: jest.fn((v: string) => v as unknown as any),
    bypassSecurityTrustStyle: jest.fn((v: string) => v as unknown as any),
    bypassSecurityTrustScript: jest.fn((v: string) => v as unknown as any),
    bypassSecurityTrustUrl: jest.fn((v: string) => v as unknown as any),
    bypassSecurityTrustResourceUrl: jest.fn((v: string) => v as unknown as any),
    sanitize: jest.fn(),
  } as any;
}

export function createLoggingServiceMock() {
  return { log: jest.fn() } as any;
}

export function createHandleErrorServiceMock() {
  return {
    handleError: jest.fn((error: any) => {
      throw error;
    }),
  } as any;
}

export function createNextHandlerMock() {
  return jest.fn((req: any) => req as any);
}

export function createRestauranteServiceMock() {
  return { getRestauranteInfo: jest.fn(), getCambiosHorario: jest.fn() } as any;
}

export function createTrabajadorServiceMock() {
  return {
    getTrabajadorId: jest.fn(),
    getTrabajadorById: jest.fn(),
    registroTrabajador: jest.fn(),
    getTrabajadores: jest.fn(),
    searchTrabajador: jest.fn(),
  } as any;
}

export function createReservaServiceMock() {
  return {
    getReservaByParameter: jest.fn(),
    getReservasByDocumento: jest.fn(),
    actualizarReserva: jest.fn(),
    crearReserva: jest.fn(),
    getContactoIdByDocumento: jest.fn(),
    getContactoById: jest.fn(),
  } as any;
}

export function createFileReaderMock(resultData = 'base64data') {
  return {
    readAsDataURL: jest.fn(function (this: any) {
      this.result = resultData;
      if (typeof this.onload === 'function') this.onload();
    }),
    onload: () => {},
    result: '',
  } as any;
}

export function createSpy() {
  return jest.fn();
}

export function createTelemetryServiceMock() {
  return {
    // Métodos de logging local
    logEvent: jest.fn(),
    logLoginAttempt: jest.fn(),
    logLoginSuccess: jest.fn(),
    logLoginFailure: jest.fn(),
    logPurchase: jest.fn(),
    logHttp: jest.fn(),
    logError: jest.fn(),
    getEvents: jest.fn().mockReturnValue([]),
    clear: jest.fn(),
    getAggregatedMetrics: jest.fn().mockReturnValue({
      login: { attempts: 0, successes: 0, failures: 0 },
      purchasesByPaymentMethod: {},
      productsCount: {},
      usersByPurchases: {},
      salesByHour: {},
      salesByWeekday: {},
    }),
    // Métodos del backend HTTP
    getDashboard: jest.fn(),
    getSales: jest.fn(),
    getProducts: jest.fn(),
    getUsers: jest.fn(),
    getTimeAnalysis: jest.fn(),
    getRentabilidad: jest.fn(),
    getSegmentacion: jest.fn(),
    getEficiencia: jest.fn(),
    getReservasAnalisis: jest.fn(),
    getPedidosAnalisis: jest.fn(),
  } as any;
}

export function createStorageErrorMock() {
  return jest.fn(() => {
    throw new Error('Storage error');
  });
}

// Additional UI/core doubles
export function createNetworkServiceMock(initialOnline = true) {
  const online$ = new BehaviorSubject<boolean>(initialOnline);
  return {
    isOnline$: online$,
    current: initialOnline,
    setLastOnlinePath: jest.fn(),
    consumeLastOnlinePath: jest.fn(),
  } as any;
}

export function createSeoServiceMock() {
  return {
    applyForRoute: jest.fn(),
    updateCanonical: jest.fn(),
  } as any;
}

export function createSwUpdateMock(opts?: {
  isEnabled?: boolean;
  versionUpdates$?: any;
  available$?: any;
  unrecoverable$?: any;
}) {
  return {
    isEnabled: opts?.isEnabled ?? true,
    versionUpdates: opts?.versionUpdates$,
    available: opts?.available$,
    unrecoverable: opts?.unrecoverable$,
    activateUpdate: jest.fn().mockResolvedValue(true),
  } as any;
}

export function createPerformanceServiceMock() {
  return {
    recordMetric: jest.fn(),
    getMetrics: jest.fn().mockReturnValue([]),
    clearMetrics: jest.fn(),
    logPerformanceMetrics: jest.fn(),
    trackRouteChange: jest.fn(),
  } as any;
}

export function createPushServiceMock() {
  return {
    registrarDispositivo: jest.fn(),
    listarDispositivos: jest.fn(),
    actualizarUltimaVista: jest.fn(),
    actualizarEstado: jest.fn(),
    actualizarTopics: jest.fn(),
    enviarNotificacion: jest.fn(),
  } as any;
}

export function createWebPushServiceMock() {
  return {
    isSupported: jest.fn(),
    getPermissionStatus: jest.fn(),
    requestPermissionAndSubscribe: jest.fn(),
    unsubscribe: jest.fn(),
  } as any;
}

export function createNativePushServiceMock() {
  return {
    init: jest.fn(),
    requestPermissions: jest.fn(),
    register: jest.fn(),
    getDeliveredNotifications: jest.fn(),
    removeAllDeliveredNotifications: jest.fn(),
  } as any;
}

export function createSwPushMock() {
  return {
    messages: of(),
    notificationClicks: of(),
    subscription: of(null),
    isEnabled: true,
    requestSubscription: jest.fn(),
    unsubscribe: jest.fn(),
  } as any;
}

export function createReservaNotificationsServiceMock() {
  return {
    notifyEstadoCambio: jest.fn(),
    notifyCreacion: jest.fn(),
  } as any;
}
