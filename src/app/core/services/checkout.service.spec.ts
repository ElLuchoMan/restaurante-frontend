import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CheckoutService } from './checkout.service';
import { CartService } from './cart.service';
import { DomicilioService } from './domicilio.service';
import { PedidoService } from './pedido.service';
import { ProductoPedidoService } from './producto-pedido.service';
import { PedidoClienteService } from './pedido-cliente.service';
import { UserService } from './user.service';
import { ClienteService } from './cliente.service';
import { Router } from '@angular/router';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let cartServiceMock: any;
  let domicilioServiceMock: any;
  let pedidoServiceMock: any;
  let productoPedidoServiceMock: any;
  let pedidoClienteServiceMock: any;
  let userServiceMock: any;
  let clienteServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    cartServiceMock = {
      getItems: jest.fn(),
      clearCart: jest.fn()
    };
    domicilioServiceMock = { createDomicilio: jest.fn() };
    pedidoServiceMock = {
      createPedido: jest.fn(),
      assignPago: jest.fn(),
      assignDomicilio: jest.fn()
    };
    productoPedidoServiceMock = { create: jest.fn() };
    pedidoClienteServiceMock = { create: jest.fn() };
    userServiceMock = { getUserId: jest.fn() };
    clienteServiceMock = { getClienteId: jest.fn() };
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        CheckoutService,
        { provide: CartService, useValue: cartServiceMock },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: ProductoPedidoService, useValue: productoPedidoServiceMock },
        { provide: PedidoClienteService, useValue: pedidoClienteServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(CheckoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should finalize order without delivery', done => {
    cartServiceMock.getItems.mockReturnValue([{ productoId: 1, nombre: 'P', cantidad: 2, precio: 10 }]);
    userServiceMock.getUserId.mockReturnValue(5);
    pedidoServiceMock.createPedido.mockReturnValue(of({ data: { pedidoId: 1 } }));
    productoPedidoServiceMock.create.mockReturnValue(of({}));
    pedidoClienteServiceMock.create.mockReturnValue(of({}));
    pedidoServiceMock.assignPago.mockReturnValue(of({}));
    pedidoServiceMock.assignDomicilio.mockReturnValue(of({}));

    service.checkout(2, false).subscribe({
      next: () => {
        expect(pedidoServiceMock.assignDomicilio).not.toHaveBeenCalled();
        expect(cartServiceMock.clearCart).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/mis-pedidos']);
        done();
      },
      error: done.fail
    });
  });

  it('should create domicilio and finalize order when delivery is needed', done => {
    cartServiceMock.getItems.mockReturnValue([{ productoId: 1, nombre: 'P', cantidad: 1, precio: 10 }]);
    userServiceMock.getUserId.mockReturnValue(10);
    clienteServiceMock.getClienteId.mockReturnValue(of({ data: { direccion: 'dir', telefono: 'tel', observaciones: '' } }));
    domicilioServiceMock.createDomicilio.mockReturnValue(of({ data: { domicilioId: 9 } }));
    pedidoServiceMock.createPedido.mockReturnValue(of({ data: { pedidoId: 2 } }));
    productoPedidoServiceMock.create.mockReturnValue(of({}));
    pedidoClienteServiceMock.create.mockReturnValue(of({}));
    pedidoServiceMock.assignPago.mockReturnValue(of({}));
    pedidoServiceMock.assignDomicilio.mockReturnValue(of({}));

    service.checkout(1, true).subscribe({
      next: () => {
        expect(clienteServiceMock.getClienteId).toHaveBeenCalledWith(10);
        expect(domicilioServiceMock.createDomicilio).toHaveBeenCalled();
        expect(pedidoServiceMock.assignDomicilio).toHaveBeenCalledWith(2, 9);
        done();
      },
      error: done.fail
    });
  });

  it('should propagate error when client data retrieval fails', done => {
    userServiceMock.getUserId.mockReturnValue(20);
    clienteServiceMock.getClienteId.mockReturnValue(throwError(() => new Error('fail')));

    service.checkout(1, true).subscribe({
      next: () => done.fail('should error'),
      error: () => {
        expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      }
    });
  });
});

