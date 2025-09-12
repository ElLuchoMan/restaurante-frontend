import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

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
  return { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
}

export function createRouterWithEventsMock(events$: any, url = '/'): jest.Mocked<Router> {
  return { navigate: jest.fn(), events: events$, url } as unknown as jest.Mocked<Router>;
}

export function createToastrMock() {
  return { success: jest.fn(), error: jest.fn(), warning: jest.fn(), clear: jest.fn() } as any;
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
    getDomicilioById: jest.fn().mockReturnValue(of({ data: { pedido: { productos: [], total: 0 }, cliente: { nombre: 'N', apellido: 'A' } } })),
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

export function createProductoPedidoServiceMock() {
  return { create: jest.fn() } as any;
}

export function createPedidoClienteServiceMock() {
  return { create: jest.fn() } as any;
}

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
  return jest.fn((req: any) => of(req));
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
  return { getReservaByParameter: jest.fn(), actualizarReserva: jest.fn(), crearReserva: jest.fn() } as any;
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
 
