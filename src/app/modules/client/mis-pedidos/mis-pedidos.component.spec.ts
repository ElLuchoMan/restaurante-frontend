import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { MisPedidosComponent } from './mis-pedidos.component';
import { PedidoService } from '../../../core/services/pedido.service';
import { UserService } from '../../../core/services/user.service';
import { Pedido } from '../../../shared/models/pedido.model';

describe('MisPedidosComponent', () => {
  let component: MisPedidosComponent;
  let fixture: ComponentFixture<MisPedidosComponent>;
  let pedidoService: { getMisPedidos: jest.Mock; getPedidoDetalles: jest.Mock };
  let userService: { getUserId: jest.Mock };

  beforeEach(async () => {
    pedidoService = {
      getMisPedidos: jest.fn(),
      getPedidoDetalles: jest.fn()
    };
    userService = {
      getUserId: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MisPedidosComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoService },
        { provide: UserService, useValue: userService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisPedidosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should sort and enrich pedidos', () => {
    userService.getUserId.mockReturnValue(5);
    const createPedido = (id: number | undefined, fecha: string, hora: string): Pedido => ({
      pedidoId: id,
      fechaPedido: fecha,
      horaPedido: hora,
      createdAt: '',
      delivery: false,
      estadoPedido: '',
      pagoId: 0,
      restauranteId: 0
    });

    const pedidos = [
      createPedido(1, '01-01-2024', '0000-01-01 10:00:00 +0000 UTC'),
      createPedido(2, '02-01-2024', '0000-01-01 09:00:00 +0000 UTC'),
      createPedido(undefined, '03-01-2024', '0000-01-01 08:00:00 +0000 UTC')
    ];
    pedidoService.getMisPedidos.mockReturnValue(of({ data: pedidos }));

    pedidoService.getPedidoDetalles.mockImplementation((id: number) => {
      if (id === 1) {
        return of({ data: { METODO_PAGO: 'CARD', PRODUCTOS: '[]' } });
      }
      return throwError(() => new Error('fail'));
    });

    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.pedidos.length).toBe(3);
    expect(component.pedidos[0].pedidoId).toBeUndefined();
    expect(component.pedidos[1].pedidoId).toBe(2);
    expect(component.pedidos[1].metodoPago).toBeUndefined();
    expect(component.pedidos[2].pedidoId).toBe(1);
    expect(component.pedidos[2].metodoPago).toBe('CARD');
    expect(component.pedidos[2].productos).toEqual([]);
  });

  it('ngOnInit should handle error from servicio', () => {
    userService.getUserId.mockReturnValue(5);
    pedidoService.getMisPedidos.mockReturnValue(throwError(() => new Error('err')));

    component.ngOnInit();

    expect(component.error).toBe('No se pudieron cargar tus pedidos');
    expect(component.pedidos).toEqual([]);
    expect(component.loading).toBe(false);
  });

  it('ngOnInit should handle empty response', () => {
    userService.getUserId.mockReturnValue(5);
    pedidoService.getMisPedidos.mockReturnValue(of({ data: undefined }));

    component.ngOnInit();

    expect(component.pedidos).toEqual([]);
  });

  describe('mergeDetalles', () => {
    const basePedido: Pedido = {
      pedidoId: 1,
      fechaPedido: '01-01-2024',
      horaPedido: '0000-01-01 00:00:00 +0000 UTC',
      createdAt: '',
      delivery: false,
      estadoPedido: '',
      pagoId: 0,
      restauranteId: 0
    };

    it('should return base when det undefined', () => {
      const res = (component as any).mergeDetalles(basePedido, undefined);
      expect(res).toEqual(basePedido);
    });

    it('should merge products and calculate totals', () => {
      const det = {
        METODO_PAGO: 'EFECTIVO',
        PRODUCTOS: JSON.stringify([
          { SUBTOTAL: 10 },
          { PRECIO_UNITARIO: 2, CANTIDAD: 3 },
          { PRECIO_UNITARIO: 5, CANTIDAD: 'bad' },
          { PRECIO_UNITARIO: 'bad', CANTIDAD: 4 },
          { precio: 7, cantidad: 2 },
          {}
        ])
      };
      const res = (component as any).mergeDetalles(basePedido, det);
      expect(res.metodoPago).toBe('EFECTIVO');
      expect(res.productos.length).toBe(6);
      expect(res.total).toBe(30);
      expect(res.items).toBe(6);
    });

    it('should handle missing product string', () => {
      const det = { METODO_PAGO: 'CARD' } as any;
      const res = (component as any).mergeDetalles(basePedido, det);
      expect(res.productos).toEqual([]);
      expect(res.total).toBe(0);
      expect(res.items).toBe(0);
    });

    it('should handle non array product string', () => {
      const det = { METODO_PAGO: 'CARD', PRODUCTOS: JSON.stringify({ foo: 1 }) };
      const res = (component as any).mergeDetalles(basePedido, det);
      expect(res.productos).toEqual([]);
      expect(res.total).toBe(0);
      expect(res.items).toBe(0);
    });

    it('should handle invalid JSON', () => {
      const det = { PRODUCTOS: 'invalid' } as any;
      const res = (component as any).mergeDetalles(basePedido, det);
      expect(res.metodoPago).toBeUndefined();
      expect(res.productos).toBeUndefined();
      expect(res.total).toBeUndefined();
      expect(res.items).toBeUndefined();
    });
  });

  it('toComparableDate should convert to UTC date', () => {
    const d = (component as any).toComparableDate('05-06-2024', '0000-01-01 08:09:10 +0000 UTC');
    expect(d.toISOString()).toBe(new Date(Date.UTC(2024, 5, 5, 8, 9, 10)).toISOString());
  });

  describe('parseFechaDDMMYYYY', () => {
    it('should parse valid date', () => {
      const res = (component as any).parseFechaDDMMYYYY('10-11-2023');
      expect(res).toEqual({ d: 10, m: 11, y: 2023 });
    });

    it('should return default for invalid date', () => {
      const res = (component as any).parseFechaDDMMYYYY('bad');
      expect(res).toEqual({ d: 1, m: 1, y: 1970 });
    });

    it('should return default for undefined', () => {
      const res = (component as any).parseFechaDDMMYYYY(undefined);
      expect(res).toEqual({ d: 1, m: 1, y: 1970 });
    });
  });

  describe('parseHora', () => {
    it('should parse valid hour', () => {
      const res = (component as any).parseHora('12:13:14 something');
      expect(res).toEqual({ hh: 12, mm: 13, ss: 14 });
    });

    it('should return zeros for invalid hour', () => {
      const res = (component as any).parseHora('bad');
      expect(res).toEqual({ hh: 0, mm: 0, ss: 0 });
    });

    it('should return zeros for undefined', () => {
      const res = (component as any).parseHora(undefined);
      expect(res).toEqual({ hh: 0, mm: 0, ss: 0 });
    });
  });
});
