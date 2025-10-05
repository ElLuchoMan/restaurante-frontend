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

// Funciones para centralizar jest.spyOn comunes
export function createServiceSpyMock(service: any, method: string, returnValue: any) {
  return jest.spyOn(service, method).mockReturnValue(returnValue);
}

export function createConsoleSpyMock(method: 'log' | 'warn' | 'error' | 'info') {
  return jest.spyOn(console, method).mockImplementation(() => {});
}

export function createDocumentSpyMock(method: string, returnValue: any) {
  return jest.spyOn(document, method).mockReturnValue(returnValue);
}

export function createWindowSpyMock(method: string, returnValue: any) {
  return jest.spyOn(window as any, method).mockReturnValue(returnValue);
}

export function createGlobalSpyMock(method: string, returnValue: any) {
  return jest.spyOn(global as any, method).mockReturnValue(returnValue);
}

export function createMatchMediaMock(matches = false) {
  return jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

export function mockElementAnimate() {
  Element.prototype.animate = jest.fn().mockImplementation(() => ({
    finished: Promise.resolve(),
    cancel: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    finish: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as any;
}

// Funciones para configurar mocks de servicios comunes
export function configureWebPushServiceMock(
  webPushMock: any,
  config: {
    isSupported?: boolean;
    getPermissionStatus?: string;
    requestPermissionAndSubscribe?: boolean;
  },
) {
  if (config.isSupported !== undefined) {
    (webPushMock.isSupported as jest.Mock).mockReturnValue(config.isSupported);
  }
  if (config.getPermissionStatus !== undefined) {
    (webPushMock.getPermissionStatus as jest.Mock).mockReturnValue(config.getPermissionStatus);
  }
  if (config.requestPermissionAndSubscribe !== undefined) {
    (webPushMock.requestPermissionAndSubscribe as jest.Mock).mockResolvedValue(
      config.requestPermissionAndSubscribe,
    );
  }
  return webPushMock;
}

export function configureUserServiceMock(
  userServiceMock: any,
  config: {
    getUserRole?: string;
    getUserId?: number;
    getToken?: string;
    decodeToken?: any;
  },
) {
  if (config.getUserRole !== undefined) {
    (userServiceMock.getUserRole as jest.Mock).mockReturnValue(config.getUserRole);
  }
  if (config.getUserId !== undefined) {
    (userServiceMock.getUserId as jest.Mock).mockReturnValue(config.getUserId);
  }
  if (config.getToken !== undefined) {
    (userServiceMock.getToken as jest.Mock).mockReturnValue(config.getToken);
  }
  if (config.decodeToken !== undefined) {
    (userServiceMock.decodeToken as jest.Mock).mockReturnValue(config.decodeToken);
  }
  return userServiceMock;
}

// Funciones para mocks de logging service
export function createLoggingServiceSpyMock(service: any, method: string, returnValue?: any) {
  const spy = jest.spyOn(service, method);
  if (returnValue !== undefined) {
    spy.mockReturnValue(returnValue);
  }
  return spy;
}

// Funciones para mocks de router
export function createRouterSpyMock(router: any, method: string, returnValue?: any) {
  const spy = jest.spyOn(router, method);
  if (returnValue !== undefined) {
    spy.mockReturnValue(returnValue);
  }
  return spy;
}

// Funciones para mocks de componentes
export function createComponentSpyMock(component: any, method: string, returnValue?: any) {
  const spy = jest.spyOn(component, method);
  if (returnValue !== undefined) {
    spy.mockReturnValue(returnValue);
  }
  return spy;
}

export function createSubjectSpyMock(subject: any, method: string) {
  return jest.spyOn(subject, method);
}

// Funciones para mocks de formularios
export function createFormSpyMock(form: any, method: string, returnValue?: any) {
  const spy = jest.spyOn(form, method);
  if (returnValue !== undefined) {
    spy.mockReturnValue(returnValue);
  }
  return spy;
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
    getObservaciones: jest.fn().mockReturnValue(''),
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
    count$: new BehaviorSubject<number>(0),
    addToCart: jest.fn(),
    changeQty: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
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

export function createReservaContactoServiceMock() {
  return {
    getContactos: jest.fn(),
    getById: jest.fn(),
  } as any;
}

export function createReservaNotificationsServiceMock() {
  return {
    notifyEstadoCambio: jest.fn().mockResolvedValue(undefined),
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
    getProductosPopulares: jest.fn(),
    // Métodos de usuario y dispositivo
    setUserDocument: jest.fn(),
    getUserDocument: jest.fn(),
    getDeviceType: jest.fn(),
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
    getCoreWebVitals: jest.fn().mockReturnValue({}),
    getCoreWebVitalsStatus: jest.fn().mockReturnValue({}),
  } as any;
}

export function createUserServiceMock(authStateObs?: any) {
  return {
    getAuthState: jest.fn().mockReturnValue(authStateObs || of(false)),
    isLoggedIn: jest.fn().mockReturnValue(false),
    login: jest.fn(),
    setRemember: jest.fn(),
    saveToken: jest.fn(),
    saveTokens: jest.fn(),
    getRefreshToken: jest.fn().mockReturnValue(null),
    getToken: jest.fn().mockReturnValue(null),
    decodeToken: jest.fn().mockReturnValue(null),
    getUserRole: jest.fn().mockReturnValue(''),
    getUserId: jest.fn().mockReturnValue(0),
    isTokenExpired: jest.fn().mockReturnValue(false),
    logout: jest.fn(),
    validateTokenAndLogout: jest.fn().mockReturnValue(null),
    refreshTokens: jest.fn(),
    attemptTokenRefresh: jest.fn().mockReturnValue(of(false)),
  } as any;
}

export function createLocationMock() {
  return {
    back: jest.fn(),
    forward: jest.fn(),
    replaceState: jest.fn(),
    go: jest.fn(),
  } as any;
}

export function createCapacitorMock(platform: string) {
  return {
    getPlatform: jest.fn().mockReturnValue(platform),
  };
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

export function createCategoriaServiceMock() {
  return {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
}

export function createSubcategoriaServiceMock() {
  return {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
}

export function createTransferStateMock() {
  const store = new Map<string, unknown>();
  return {
    get: jest.fn((key: any, defaultValue: unknown) => {
      const storeKey = key.toString();
      return store.has(storeKey) ? store.get(storeKey) : defaultValue;
    }),

    set: jest.fn((key: any, value: unknown) => {
      store.set(key.toString(), value);
    }),

    remove: jest.fn((key: any) => {
      store.delete(key.toString());
    }),

    hasKey: jest.fn((key: any) => store.has(key.toString())),
  } as any;
}

export function createErrorBoundaryServiceMock() {
  return {
    safeExecute: jest.fn(
      (
        fn: () => unknown,
        _component: string,
        _fallback?: unknown,
        onError?: (error: Error) => void,
      ) => {
        try {
          return fn();
        } catch (error) {
          onError?.(error as Error);
          return undefined;
        }
      },
    ),

    captureError: jest.fn(),
  } as any;
}

export function createSmartSearchServiceMock() {
  return {
    getDefaultFilters: jest.fn(() => ({
      query: '',
      category: '',
      subcategory: '',
      priceRange: { min: 0, max: 100 },
      caloriesRange: { min: 0, max: 1000 },
      prepTimeRange: { min: 0, max: 60 },
      allergens: [],
      dietary: [],
      sortBy: 'name',
      sortOrder: 'asc',
    })),

    getSearchHistory: jest.fn(),

    getCurrentFilters: jest.fn(),

    updateFilters: jest.fn(),

    addToSearchHistory: jest.fn(),

    getSuggestions: jest.fn(() => []),

    searchProducts: jest.fn((products: any[]) => [...products]),
  } as any;
}

export function createFavoritesServiceMock() {
  return {
    getFavorites: jest.fn(),

    toggleFavorite: jest.fn().mockReturnValue(true),

    addFavorite: jest.fn(),

    removeFavorite: jest.fn(),

    isFavorite: jest.fn(),
  } as any;
}

export function createThemeServiceMock() {
  return {
    getCurrentTheme: jest.fn(),

    toggleTheme: jest.fn(),

    setTheme: jest.fn(),
  } as any;
}
