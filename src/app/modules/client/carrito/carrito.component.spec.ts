import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { ModalService } from '../../../core/services/modal.service';
import { PedidoClienteService } from '../../../core/services/pedido-cliente.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoPedidoService } from '../../../core/services/producto-pedido.service';
import { UserService } from '../../../core/services/user.service';
import {
    createCartServiceMock,
    createClienteServiceMock,
    createDomicilioServiceMock,
    createMetodosPagoServiceMock,
    createModalServiceMock,
    createPedidoClienteServiceMock,
    createPedidoServiceMock,
    createProductoPedidoServiceMock,
    createRouterMock,
    createToastrMock,
    createUserServiceMock,
} from '../../../shared/mocks/test-doubles';
import { Producto } from '../../../shared/models/producto.model';
import { CarritoComponent } from './carrito.component';

describe('CarritoComponent', () => {
  let component: CarritoComponent;
  let fixture: ComponentFixture<CarritoComponent>;

  let cartServiceMock: any;
  let modalServiceMock: any;
  let metodosPagoServiceMock: any;
  let domicilioServiceMock: any;
  let pedidoServiceMock: any;
  let productoPedidoServiceMock: any;
  let pedidoClienteServiceMock: any;
  let userServiceMock: any;
  let clienteServiceMock: any;
  let routerMock: any;
  let toastrServiceMock: any;

  async function setup({
    items = [],
    paymentResp = { data: [] },
  }: { items?: any[]; paymentResp?: any } = {}) {
    cartServiceMock = createCartServiceMock();
    cartServiceMock.items$ = new BehaviorSubject<Producto[]>(items as Producto[]);
    modalServiceMock = createModalServiceMock();
    metodosPagoServiceMock = createMetodosPagoServiceMock(paymentResp);
    domicilioServiceMock = createDomicilioServiceMock();
    pedidoServiceMock = createPedidoServiceMock();
    productoPedidoServiceMock = createProductoPedidoServiceMock();
    pedidoClienteServiceMock = createPedidoClienteServiceMock();
    userServiceMock = createUserServiceMock();
    clienteServiceMock = createClienteServiceMock();
    routerMock = createRouterMock();
    toastrServiceMock = createToastrMock();

    await TestBed.configureTestingModule({
      imports: [CarritoComponent],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: MetodosPagoService, useValue: metodosPagoServiceMock },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: ProductoPedidoService, useValue: productoPedidoServiceMock },
        { provide: PedidoClienteService, useValue: pedidoClienteServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
  });

  it('should compute totals and load payment methods on init', async () => {
    await setup({
      items: [{ productoId: 1, nombre: 'A', precio: 10, cantidad: 2, calorias: 50 }],
      paymentResp: { data: [{ metodoPagoId: 1, tipo: 'Efectivo' }] },
    });
    expect(component.carrito.length).toBe(1);
    expect(component.subtotal).toBe(20);
    expect(component.totalCalorias).toBe(100);
    expect(component.paymentMethods).toEqual([{ metodoPagoId: 1, tipo: 'Efectivo' }]);
  });

  it('should use default values when quantity or calories are missing', async () => {
    await setup({ items: [{ productoId: 1, nombre: 'B', precio: 5 }], paymentResp: { data: [] } });
    expect(component.subtotal).toBe(5);
    expect(component.totalCalorias).toBe(0);
  });

  it('should set payment methods to empty array when service returns no data', async () => {
    await setup({ paymentResp: {} });
    expect(component.paymentMethods).toEqual([]);
  });

  it('should unsubscribe on destroy', async () => {
    await setup();
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should interact with cart service for item operations', async () => {
    await setup();
    const product = { productoId: 1 } as Producto;
    component.sumar(product);
    expect(cartServiceMock.changeQty).toHaveBeenCalledWith(1, 1);
    component.restar(product);
    expect(cartServiceMock.changeQty).toHaveBeenCalledWith(1, -1);
    component.eliminar(product);
    expect(cartServiceMock.remove).toHaveBeenCalledWith(1);
  });

  it('should open modal with payment options when creating order', async () => {
    await setup({ paymentResp: { data: [{ metodoPagoId: 1, tipo: 'Card' }] } });
    const confirmSpy = jest
      .spyOn(component as any, 'onCheckoutConfirm')
      .mockImplementation(() => {});
    component.crearOrden();
    expect(modalServiceMock.openModal).toHaveBeenCalled();
    const config = modalServiceMock.openModal.mock.calls[0][0];
    expect(config.selects[0].options).toEqual([{ label: 'Card', value: 1 }]);
    expect(config.input).toEqual({ label: 'Observaciones', value: '' });
    config.buttons[0].action();
    expect(modalServiceMock.closeModal).toHaveBeenCalled();
    config.buttons[1].action();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should set needsDelivery true and call fetchCliente and crearDomicilio when delivery is selected', async () => {
    await setup({ paymentResp: { data: [{ metodoPagoId: 4, tipo: 'Cash' }] } });
    component.crearOrden();

    const config = modalServiceMock.openModal.mock.calls[0][0];
    config.selects[0].selected = 4;
    config.selects[1].selected = true;
    modalServiceMock.getModalData.mockReturnValue({
      selects: config.selects,
      input: { value: 'nota' },
    });

    userServiceMock.getUserId.mockReturnValue(42);
    const fetchClienteSpy = jest
      .spyOn(component as any, 'fetchCliente')
      .mockResolvedValue({} as any);
    const crearDomicilioSpy = jest.spyOn(component as any, 'crearDomicilio').mockResolvedValue(12);
    const finalizeSpy = jest.spyOn(component as any, 'finalizeOrder').mockResolvedValue(undefined);

    await config.buttons[1].action();

    expect(modalServiceMock.getModalData).toHaveBeenCalled();
    const modalData = modalServiceMock.getModalData.mock.results[0].value;
    expect(modalData.selects[1].selected).toBe(true);
    expect(fetchClienteSpy).toHaveBeenCalled();
    expect(crearDomicilioSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Number),
      'Cash',
      'nota',
    );
    expect(finalizeSpy).toHaveBeenCalledWith(4, 12);
  });

  it('should finalize order without delivery', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: 2, options: [{ label: 'M2', value: 2 }] }, { selected: false }],
      input: { value: '' },
    });
    const finalizeSpy = jest.spyOn(component as any, 'finalizeOrder').mockResolvedValue(undefined);
    await (component as any).onCheckoutConfirm();
    expect(modalServiceMock.closeModal).toHaveBeenCalled();
    expect(finalizeSpy).toHaveBeenCalledWith(2, null);
  });

  it('should create domicilio and finalize order when delivery is needed', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: 3, options: [{ label: 'M3', value: 3 }] }, { selected: true }],
      input: { value: 'obs' },
    });
    userServiceMock.getUserId.mockReturnValue(77);
    clienteServiceMock.getClienteId.mockReturnValue(
      of({ data: { direccion: 'dir', telefono: 'tel', observaciones: '' } }),
    );
    domicilioServiceMock.createDomicilio.mockReturnValue(of({ data: { domicilioId: 9 } }));
    const finalizeSpy = jest.spyOn(component as any, 'finalizeOrder').mockImplementation(() => {});
    await (component as any).onCheckoutConfirm();
    expect(clienteServiceMock.getClienteId).toHaveBeenCalledWith(77);
    expect(domicilioServiceMock.createDomicilio).toHaveBeenCalledWith(
      expect.objectContaining({
        observaciones: 'Método pago: M3 - Observaciones: obs',
      }),
    );
    expect(finalizeSpy).toHaveBeenCalledWith(3, 9);
  });

  it('should handle string "true" for delivery selection', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: 4, options: [{ label: 'M4', value: 4 }] }, { selected: 'true' }],
      input: { value: '' },
    });
    userServiceMock.getUserId.mockReturnValue(88);
    clienteServiceMock.getClienteId.mockReturnValue(
      of({ data: { direccion: 'dir2', telefono: 'tel2', observaciones: '' } }),
    );
    domicilioServiceMock.createDomicilio.mockReturnValue(of({ data: { domicilioId: 5 } }));
    const finalizeSpy = jest.spyOn(component as any, 'finalizeOrder').mockImplementation(() => {});
    await (component as any).onCheckoutConfirm();
    expect(clienteServiceMock.getClienteId).toHaveBeenCalledWith(88);
    expect(domicilioServiceMock.createDomicilio).toHaveBeenCalled();
    expect(finalizeSpy).toHaveBeenCalledWith(4, 5);
  });

  it('should handle error when getting client data fails', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: 1, options: [{ label: 'M1', value: 1 }] }, { selected: true }],
      input: { value: '' },
    });
    userServiceMock.getUserId.mockReturnValue(10);
    clienteServiceMock.getClienteId.mockReturnValue(throwError(() => new Error('fail')));
    const finalizeSpy = jest.spyOn(component as any, 'finalizeOrder').mockResolvedValue(undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    await (component as any).onCheckoutConfirm().catch(() => {});
    expect(finalizeSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(2);
    errorSpy.mockRestore();
  });

  it('should handle error when creating domicilio fails', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: 4, options: [{ label: 'M4', value: 4 }] }, { selected: true }],
      input: { value: '' },
    });
    userServiceMock.getUserId.mockReturnValue(20);
    clienteServiceMock.getClienteId.mockReturnValue(
      of({ data: { direccion: 'a', telefono: 'b', observaciones: '' } }),
    );
    domicilioServiceMock.createDomicilio.mockReturnValue(throwError(() => new Error('dom fail')));
    const finalizeSpy = jest.spyOn(component as any, 'finalizeOrder').mockResolvedValue(undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    await (component as any).onCheckoutConfirm().catch(() => {});
    expect(finalizeSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(2);
    errorSpy.mockRestore();
  });

  it('should create order flow without domicilio', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 2, precio: 10 }];
    userServiceMock.getUserId.mockReturnValue(5);
    pedidoServiceMock.createPedido.mockReturnValue(of({ data: { pedidoId: 99 } }));
    productoPedidoServiceMock.create.mockReturnValue(of({}));
    pedidoClienteServiceMock.create.mockReturnValue(of({}));
    pedidoServiceMock.assignDomicilio.mockReturnValue(of({}));
    await (component as any).finalizeOrder(1, null);
    expect(pedidoServiceMock.createPedido).toHaveBeenCalledWith({
      delivery: false,
    });
    expect(pedidoServiceMock.assignPago).not.toHaveBeenCalled();
    expect(pedidoServiceMock.assignDomicilio).not.toHaveBeenCalled();
    expect(cartServiceMock.clearCart).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/mis-pedidos']);
  });

  it('should assign domicilio when domicilioId is provided', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    userServiceMock.getUserId.mockReturnValue(5);
    pedidoServiceMock.createPedido.mockReturnValue(of({ data: { pedidoId: 50 } }));
    productoPedidoServiceMock.create.mockReturnValue(of({}));
    pedidoClienteServiceMock.create.mockReturnValue(of({}));
    pedidoServiceMock.assignDomicilio.mockReturnValue(
      of({ data: { delivery: true, estadoPedido: 'EN CURSO' } }),
    );
    await (component as any).finalizeOrder(2, 7);
    expect(pedidoServiceMock.createPedido).toHaveBeenCalledWith({
      delivery: true,
    });
    expect(pedidoServiceMock.assignPago).not.toHaveBeenCalled();
    expect(pedidoServiceMock.assignDomicilio).toHaveBeenCalledWith(50, 7);
  });

  it('should handle error in finalizeOrder flow', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    pedidoServiceMock.createPedido.mockReturnValue(throwError(() => new Error('fail')));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    await (component as any).finalizeOrder(3, null).catch(() => {});
    expect(errorSpy).toHaveBeenCalled();
    expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
