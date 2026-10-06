import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { ModalService } from '../../../core/services/modal.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';
import {
  createCartServiceMock,
  createClienteServiceMock,
  createComponentSpyMock,
  createMetodosPagoServiceMock,
  createModalServiceMock,
  createPedidoServiceMock,
  createRouterMock,
  createSubjectSpyMock,
  createTelemetryServiceMock,
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
  let pedidoServiceMock: any;
  let userServiceMock: any;
  let clienteServiceMock: any;
  let routerMock: any;
  let toastrServiceMock: any;
  let telemetryMock: any;

  async function setup({
    items = [],
    paymentResp = { data: [] },
  }: { items?: any[]; paymentResp?: any } = {}) {
    cartServiceMock = createCartServiceMock();
    cartServiceMock.items$ = new BehaviorSubject<Producto[]>(items as Producto[]);
    modalServiceMock = createModalServiceMock();
    metodosPagoServiceMock = createMetodosPagoServiceMock(paymentResp);
    pedidoServiceMock = createPedidoServiceMock();
    userServiceMock = createUserServiceMock();
    clienteServiceMock = createClienteServiceMock();
    routerMock = createRouterMock();
    toastrServiceMock = createToastrMock();
    telemetryMock = createTelemetryServiceMock();

    await TestBed.configureTestingModule({
      imports: [CarritoComponent, CommonModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: MetodosPagoService, useValue: metodosPagoServiceMock },
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: TelemetryService, useValue: telemetryMock },
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
    const nextSpy = createSubjectSpyMock((component as any).destroy$, 'next');
    const completeSpy = createSubjectSpyMock((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should interact with cart service for item operations', async () => {
    await setup();
    const product = { productoId: 1, observaciones: 'Sin cebolla' } as Producto;
    component.sumar(product);
    expect(cartServiceMock.changeQty).toHaveBeenCalledWith(1, 1, 'Sin cebolla');
    component.restar(product);
    expect(cartServiceMock.changeQty).toHaveBeenCalledWith(1, -1, 'Sin cebolla');
    component.eliminar(product);
    expect(cartServiceMock.remove).toHaveBeenCalledWith(1, 'Sin cebolla');
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
    // El campo de observaciones ahora es automático en el modal, no se pasa como input
    expect(config.input).toBeUndefined();
    config.buttons[0].action();
    expect(modalServiceMock.closeModal).toHaveBeenCalled();
    config.buttons[1].action();
    expect(confirmSpy).toHaveBeenCalled();
  });

  const checkoutOk = (monto = 20) =>
    of({ code: 201, message: 'ok', data: { pedidoId: 99, pagoId: { pagoId: 301 }, monto } });

  function selecciona(metodo: number, label: string, delivery: boolean | string, obs = '') {
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: metodo, options: [{ label, value: metodo }] }, { selected: delivery }],
    });
    modalServiceMock.getObservaciones.mockReturnValue(obs);
  }

  it('should check out in ONE call without delivery (no domicilio, no intermediate steps)', async () => {
    await setup({ paymentResp: { data: [{ metodoPagoId: 2, tipo: 'Nequi' }] } });
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 2, precio: 10 }];
    userServiceMock.getUserId.mockReturnValue(5);
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk(20));
    selecciona(2, 'Nequi', false);

    await (component as any).onCheckoutConfirm();

    expect(modalServiceMock.closeModal).toHaveBeenCalled();
    expect(pedidoServiceMock.checkout).toHaveBeenCalledTimes(1);
    const body = pedidoServiceMock.checkout.mock.calls[0][0];
    expect(body).toEqual({
      restauranteId: 1,
      productos: [{ productoId: 1, cantidad: 2 }],
      pago: { metodoPagoId: 2 },
    });
    // el cliente sale del token y el monto lo calcula el servidor: no se envían
    expect(body).not.toHaveProperty('documentoCliente');
    expect(body).not.toHaveProperty('domicilio');
    expect(body.pago).not.toHaveProperty('monto');
    expect(clienteServiceMock.getClienteId).not.toHaveBeenCalled();
    expect(cartServiceMock.clearCart).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/mis-pedidos']);
    expect(telemetryMock.logPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        paymentMethodId: 2,
        paymentMethodLabel: 'Nequi',
        requiresDelivery: false,
        subtotal: 20,
      }),
    );
  });

  it('should handle a missing method label (option not found) and use the id for telemetry', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk());
    modalServiceMock.getModalData.mockReturnValue({
      selects: [{ selected: 99, options: [{ label: 'M1', value: 1 }] }, { selected: false }],
    });
    modalServiceMock.getObservaciones.mockReturnValue(undefined);
    await (component as any).onCheckoutConfirm();
    expect(pedidoServiceMock.checkout.mock.calls[0][0].pago).toEqual({ metodoPagoId: 99 });
    expect(telemetryMock.logPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethodLabel: '99' }),
    );
  });

  it('should send the domicilio inside the same checkout call when delivery is needed', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    selecciona(3, 'M3', true, 'obs');
    userServiceMock.getUserId.mockReturnValue(77);
    clienteServiceMock.getClienteId.mockReturnValue(
      of({ data: { direccion: 'dir', telefono: 'tel', observaciones: '' } }),
    );
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk(10));

    await (component as any).onCheckoutConfirm();

    expect(clienteServiceMock.getClienteId).toHaveBeenCalledWith(77);
    expect(pedidoServiceMock.checkout).toHaveBeenCalledTimes(1);
    expect(pedidoServiceMock.checkout.mock.calls[0][0]).toEqual({
      restauranteId: 1,
      domicilio: {
        direccion: 'dir',
        telefono: 'tel',
        observaciones: 'Método pago: M3 - Observaciones generales: obs',
      },
      productos: [{ productoId: 1, cantidad: 1 }],
      pago: { metodoPagoId: 3 },
    });
    expect(telemetryMock.logPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ requiresDelivery: true }),
    );
  });

  it('should handle string "true" for delivery selection', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    selecciona(4, 'M4', 'true');
    userServiceMock.getUserId.mockReturnValue(88);
    clienteServiceMock.getClienteId.mockReturnValue(
      of({ data: { direccion: 'dir2', telefono: 'tel2' } }),
    );
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk());
    await (component as any).onCheckoutConfirm();
    expect(clienteServiceMock.getClienteId).toHaveBeenCalledWith(88);
    expect(pedidoServiceMock.checkout.mock.calls[0][0].domicilio).toEqual({
      direccion: 'dir2',
      telefono: 'tel2',
      observaciones: 'Método pago: M4 - Sin observaciones',
    });
  });

  it('should include per-product observations in the domicilio', async () => {
    await setup();
    component.carrito = [
      { productoId: 1, nombre: 'Arepa', cantidad: 2, precio: 10, observaciones: 'tostada' },
      { productoId: 2, nombre: 'Jugo', cantidad: 1, precio: 5, observaciones: 'sin azúcar' },
    ] as any;
    selecciona(3, 'Efectivo', true, 'puerta azul');
    userServiceMock.getUserId.mockReturnValue(123);
    clienteServiceMock.getClienteId.mockReturnValue(
      of({ data: { direccion: 'Calle 1', telefono: '300' } }),
    );
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk());

    await (component as any).onCheckoutConfirm();

    const obs = String(pedidoServiceMock.checkout.mock.calls[0][0].domicilio.observaciones);
    expect(obs).toContain('Observaciones generales: puerta azul');
    expect(obs).toContain('Observaciones por producto:');
    expect(obs).toContain('• Arepa (x2): tostada');
    expect(obs).toContain('• Jugo (x1): sin azúcar');
  });

  it.each([
    ['the request fails', () => throwError(() => new Error('fail'))],
    ['the response has no data', () => of({ data: null })],
  ])('should not check out when getting the client data fails because %s', async (_n, resp) => {
    await setup();
    selecciona(1, 'M1', true);
    userServiceMock.getUserId.mockReturnValue(10);
    clienteServiceMock.getClienteId.mockReturnValue(resp());
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    await (component as any).onCheckoutConfirm();
    expect(pedidoServiceMock.checkout).not.toHaveBeenCalled();
    // un único aviso al usuario (sin cascada de errores)
    expect(toastrServiceMock.error).toHaveBeenCalledTimes(1);
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Error al obtener datos del cliente',
      'Error',
    );
    expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('should ignore a second confirm while the checkout is in flight and allow it afterwards', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    selecciona(1, 'M1', false);
    const pendiente = new Subject<any>();
    pedidoServiceMock.checkout.mockReturnValue(pendiente);

    const primero = (component as any).onCheckoutConfirm();
    await (component as any).onCheckoutConfirm(); // segundo clic: se ignora
    expect(pedidoServiceMock.checkout).toHaveBeenCalledTimes(1);

    pendiente.next({ data: { monto: 10 } });
    pendiente.complete();
    await primero;

    pedidoServiceMock.checkout.mockReturnValue(checkoutOk());
    await (component as any).onCheckoutConfirm();
    expect(pedidoServiceMock.checkout).toHaveBeenCalledTimes(2);
  });

  it('should allow retrying after a failed checkout (nothing was saved by the server)', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    selecciona(1, 'M1', false);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    pedidoServiceMock.checkout.mockReturnValueOnce(
      throwError(() => ({ code: 500, message: 'detalle interno' })),
    );
    await (component as any).onCheckoutConfirm();
    expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
    pedidoServiceMock.checkout.mockReturnValueOnce(checkoutOk());
    await (component as any).onCheckoutConfirm();
    expect(pedidoServiceMock.checkout).toHaveBeenCalledTimes(2);
    expect(cartServiceMock.clearCart).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it('should show specific toastr with the inventory detail of the 409 and keep the cart', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 5, precio: 10 }] as Producto[];
    selecciona(1, 'M1', false);
    pedidoServiceMock.checkout.mockReturnValue(
      throwError(() => ({
        code: 409,
        message: 'Inventario insuficiente para uno o más productos',
        cause: 'No especificado',
        data: [
          { productoId: 1, requerido: 5, disponible: 2 },
          { productoId: 99, requerido: 1, disponible: 0 },
        ],
      })),
    );
    await (component as any).onCheckoutConfirm();
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No hay suficiente inventario: P1 (pediste 5, disponible 2), Producto 99 (pediste 1, disponible 0). Por favor, reduce las cantidades.',
      'Inventario Insuficiente',
    );
    expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(telemetryMock.logPurchase).not.toHaveBeenCalled();
  });

  it.each([403, 404, 409])(
    'should append the reason of a %i without inventory detail',
    async (code) => {
      await setup();
      component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
      selecciona(1, 'M1', false);
      pedidoServiceMock.checkout.mockReturnValue(
        throwError(() => ({ code, message: 'Método de pago no encontrado' })),
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      await (component as any).onCheckoutConfirm();
      expect(toastrServiceMock.error).toHaveBeenCalledWith(
        'Error al crear el pedido. Intenta nuevamente. Método de pago no encontrado',
        'Error',
      );
      expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    },
  );

  it('should not append the reason of other statuses such as 500, nor of errors without code', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    selecciona(1, 'M1', false);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    for (const err of [{ code: 500, message: 'detalle interno' }, new Error('boom')]) {
      pedidoServiceMock.checkout.mockReturnValue(throwError(() => err));
      await (component as any).onCheckoutConfirm();
    }
    expect(toastrServiceMock.error).toHaveBeenCalledTimes(2);
    expect(toastrServiceMock.error).toHaveBeenNthCalledWith(
      2,
      'Error al crear el pedido. Intenta nuevamente.',
      'Error',
    );
    expect(toastrServiceMock.error).toHaveBeenNthCalledWith(
      1,
      'Error al crear el pedido. Intenta nuevamente.',
      'Error',
    );
    errorSpy.mockRestore();
  });

  it('should treat a 409 whose data is not a list as a plain error', async () => {
    await setup();
    selecciona(1, 'M1', false);
    pedidoServiceMock.checkout.mockReturnValue(
      throwError(() => ({ code: 409, message: 'conflicto', data: 'x' })),
    );
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    await (component as any).onCheckoutConfirm();
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Error al crear el pedido. Intenta nuevamente. conflicto',
      'Error',
    );
    errorSpy.mockRestore();
  });

  it('should treat a null error as a generic failure', async () => {
    await setup();
    selecciona(1, 'M1', false);
    pedidoServiceMock.checkout.mockReturnValue(throwError(() => null));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    await (component as any).onCheckoutConfirm();
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Error al crear el pedido. Intenta nuevamente.',
      'Error',
    );
    errorSpy.mockRestore();
  });

  it('should use the total returned by the server (not the local preview) for toast and telemetry', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 2, precio: 10 }];
    component.subtotal = 20; // vista previa local, distinta de lo que cobra el servidor
    userServiceMock.getUserId.mockReturnValue(5);
    selecciona(1, 'M1', false);
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk(35000));

    await (component as any).onCheckoutConfirm();

    expect(telemetryMock.logPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 35000 }),
    );
    expect(toastrServiceMock.success).toHaveBeenCalledWith(
      `Tu pedido por $${(35000).toLocaleString('es-CO')} ha sido creado. Pronto recibirás actualizaciones.`,
      'Pedido Exitoso',
    );
  });

  it('should log a null userId when there is no session user', async () => {
    await setup();
    component.carrito = [{ productoId: 1, nombre: 'P1', cantidad: 1, precio: 10 }];
    userServiceMock.getUserId.mockReturnValue(null);
    selecciona(1, 'M1', false);
    pedidoServiceMock.checkout.mockReturnValue(checkoutOk());
    await (component as any).onCheckoutConfirm();
    expect(pedidoServiceMock.checkout.mock.calls[0][0]).not.toHaveProperty('documentoCliente');
    expect(telemetryMock.logPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null }),
    );
    expect(cartServiceMock.clearCart).toHaveBeenCalled();
  });

  it('should generate stable trackBy key including observaciones', async () => {
    await setup();
    const key = component.trackByProductId(0, {
      productoId: 10,
      observaciones: 'sin sal',
    } as any);
    expect(key).toBe('10-sin sal');
  });

  it('should navigate back to menu on volverAlMenu', async () => {
    await setup();
    component.volverAlMenu();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/menu']);
  });

  it('should announce removal without observations text when product has none', async () => {
    await setup();
    const live = TestBed.inject(LiveAnnouncerService);
    const announceSpy = jest.spyOn(live, 'announce');
    component.eliminar({ productoId: 2, nombre: 'Jugo' } as Producto);
    expect(cartServiceMock.remove).toHaveBeenCalledWith(2, undefined);
    expect(announceSpy).toHaveBeenCalledWith('Jugo eliminado del carrito');
  });

  it('should announce removal including observations text when present', async () => {
    await setup();
    const live = TestBed.inject(LiveAnnouncerService);
    const announceSpy = jest.spyOn(live, 'announce');
    component.eliminar({ productoId: 2, nombre: 'Jugo', observaciones: 'sin hielo' } as Producto);
    expect(announceSpy).toHaveBeenCalledWith('Jugo (sin hielo) eliminado del carrito');
  });

  it('should include product observations in the modal message and ignore blank ones', async () => {
    await setup({
      items: [
        {
          productoId: 1,
          nombre: 'Hamburguesa',
          precio: 10,
          cantidad: 2,
          observaciones: 'sin cebolla',
        },
        { productoId: 2, nombre: 'Jugo', precio: 5, cantidad: 1, observaciones: '   ' },
        { productoId: 3, nombre: 'Papas', precio: 4, cantidad: 1 },
      ],
      paymentResp: { data: [{ metodoPagoId: 1, tipo: 'Efectivo' }] },
    });

    component.crearOrden();

    const config = modalServiceMock.openModal.mock.calls[0][0];
    expect(config.message).toBe('Observaciones de productos:\n\n• Hamburguesa (x2): sin cebolla\n');
  });

  it('should leave the modal message undefined when no product has observations', async () => {
    await setup({ items: [{ productoId: 3, nombre: 'Papas', precio: 4, cantidad: 1 }] });

    component.crearOrden();

    const config = modalServiceMock.openModal.mock.calls[0][0];
    expect(config.message).toBeUndefined();
  });
});
