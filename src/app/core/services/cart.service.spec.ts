import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Producto } from '../../shared/models/producto.model';
import { CartService } from './cart.service';

const STORAGE_KEY = 'carrito';
const LAST_KEY = `${STORAGE_KEY}-lastClear`;

function createProduct(id: number): Producto {
  return { productoId: id, nombre: `P${id}`, precio: 10 } as any;
}

describe('CartService', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    const mockLS = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        store = {};
      },
    };
    Object.defineProperty(window, 'localStorage', { value: mockLS, writable: true });
  });

  function init(platform: 'browser' | 'server' = 'browser'): CartService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(CartService);
  }

  it('clears old cart on init', () => {
    store[STORAGE_KEY] = JSON.stringify([createProduct(1)]);
    store[LAST_KEY] = '2000-01-01';
    const today = new Date().toISOString().split('T')[0];
    const service = init();
    expect(store[STORAGE_KEY]).toBeUndefined();
    expect(store[LAST_KEY]).toBe(today);
    expect(service.count$.value).toBe(0);
  });

  it('loads existing cart when date is today', () => {
    const prod = createProduct(2);
    store[STORAGE_KEY] = JSON.stringify([prod]);
    const today = new Date().toISOString().split('T')[0];
    store[LAST_KEY] = today;
    const service = init();
    expect(service.getItems().length).toBe(1);
    expect(service.count$.value).toBe(1);
  });

  it('adds products and increases quantity', () => {
    const service = init();
    const prod = createProduct(3);
    service.addToCart(prod);
    expect(service.count$.value).toBe(1);
    service.addToCart(prod);
    expect(service.getItems()[0].cantidad).toBe(2);
    expect(service.count$.value).toBe(2);
  });

  it('changes quantity and removes when zero', () => {
    const service = init();
    const prod = createProduct(4);
    service.addToCart(prod);
    service.changeQty(4, 2);
    expect(service.getItems()[0].cantidad).toBe(3);
    service.changeQty(4, -3);
    expect(service.getItems().length).toBe(0);
    expect(service.count$.value).toBe(0);
  });

  it('removes a product', () => {
    const service = init();
    const p1 = createProduct(5);
    const p2 = createProduct(6);
    service.addToCart(p1);
    service.addToCart(p2);
    service.remove(5);
    expect(service.getItems().length).toBe(1);
    expect(service.getItems()[0].productoId).toBe(6);
  });

  it('clears cart manually', () => {
    const service = init();
    service.addToCart(createProduct(7));
    service.clearCart();
    expect(store[STORAGE_KEY]).toBeUndefined();
    expect(store[LAST_KEY]).toBeUndefined();
    expect(service.count$.value).toBe(0);
  });

  it('handles non-browser platform', () => {
    const service = init('server');
    (service as any).clearIfNeeded();
    (service as any).loadCart();
    service.addToCart(createProduct(8));
    expect(service.getItems().length).toBe(0);
    (service as any).saveCart([createProduct(9)]);
    expect(service.getItems().length).toBe(0);
    service.changeQty(8, 1);
    service.remove(8);
    service.clearCart();
    expect(service.count$.value).toBe(0);
  });

  it('handles items without quantity', () => {
    const service = init();
    (service as any).saveCart([{ productoId: 10 } as any, { productoId: 11, cantidad: 2 } as any]);
    expect(service.count$.value).toBe(3);
    service.addToCart({ productoId: 10 } as any);
    expect(service.getItems().find((p) => p.productoId === 10)?.cantidad).toBe(2);
    (service as any).saveCart([{ productoId: 12 } as any, { productoId: 13, cantidad: 1 } as any]);
    service.changeQty(12, 1);
    expect(service.getItems().find((p) => p.productoId === 12)?.cantidad).toBe(2);
  });

  it('loads empty cart when storage missing', () => {
    const service = init();
    store = {};
    (service as any).loadCart();
    expect(service.count$.value).toBe(0);
  });
});
