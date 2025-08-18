import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { CarritoComponent } from './carrito.component';
import { CartService } from '../../../core/services/cart.service';
import { ModalService } from '../../../core/services/modal.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { CheckoutService } from '../../../core/services/checkout.service';

import { Producto } from '../../../shared/models/producto.model';

describe('CarritoComponent', () => {
  let component: CarritoComponent;
  let fixture: ComponentFixture<CarritoComponent>;

  let cartServiceMock: any;
  let modalServiceMock: any;
  let metodosPagoServiceMock: any;
  let checkoutServiceMock: any;

  async function setup({
    items = [],
    paymentResp = { data: [] }
  }: { items?: any[]; paymentResp?: any } = {}) {
    cartServiceMock = {
      items$: new BehaviorSubject<Producto[]>(items as Producto[]),
      changeQty: jest.fn(),
      remove: jest.fn(),
      clearCart: jest.fn(),
    };
    modalServiceMock = {
      openModal: jest.fn(),
      closeModal: jest.fn(),
      getModalData: jest.fn(),
    };
    metodosPagoServiceMock = {
      getAll: jest.fn().mockReturnValue(of(paymentResp)),
    };
    checkoutServiceMock = { checkout: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [CarritoComponent],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: MetodosPagoService, useValue: metodosPagoServiceMock },
        { provide: CheckoutService, useValue: checkoutServiceMock },
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
    const spy = jest.spyOn((component as any).sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
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
    const confirmSpy = jest.spyOn(component as any, 'onCheckoutConfirm').mockImplementation(() => {});
    component.crearOrden();
    expect(modalServiceMock.openModal).toHaveBeenCalled();
    const config = modalServiceMock.openModal.mock.calls[0][0];
    expect(config.selects[0].options).toEqual([{ label: 'Card', value: 1 }]);
    config.buttons[0].action();
    expect(modalServiceMock.closeModal).toHaveBeenCalled();
    config.buttons[1].action();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should call checkout service without delivery', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({ selects: [{ selected: 2 }, { selected: false }] });
    checkoutServiceMock.checkout.mockReturnValue(of({}));
    (component as any).onCheckoutConfirm();
    expect(modalServiceMock.closeModal).toHaveBeenCalled();
    expect(checkoutServiceMock.checkout).toHaveBeenCalledWith(2, false);
  });

  it('should call checkout service with delivery', async () => {
    await setup();
    modalServiceMock.getModalData.mockReturnValue({ selects: [{ selected: 3 }, { selected: true }] });
    checkoutServiceMock.checkout.mockReturnValue(of({}));
    (component as any).onCheckoutConfirm();
    expect(checkoutServiceMock.checkout).toHaveBeenCalledWith(3, true);
  });
});

