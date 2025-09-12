import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PedidoService } from '../../../core/services/pedido.service';
import { createPedidoServiceMock } from '../../../shared/mocks/test-doubles';
import { PedidoComponent } from './pedido.component';

describe('PedidoComponent', () => {
  let component: PedidoComponent;
  let fixture: ComponentFixture<PedidoComponent>;
  let pedidoService: any;

  beforeEach(async () => {
    pedidoService = createPedidoServiceMock();

    await TestBed.configureTestingModule({
      imports: [PedidoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pedido on init', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({
        data: {
          PK_ID_PEDIDO: 5,
          PRODUCTOS: '[]',
          METODO_PAGO: 'Nequi',
          FECHA: '01-01-2024',
          HORA: '0000-01-01 10:00:00 +0000 UTC',
          delivery: true,
          ESTADO_PEDIDO: 'TERMINADO',
        },
      }),
    );
    component.ngOnInit();
    expect(pedidoService.getPedidoDetalles).toHaveBeenCalledWith(5);
    expect(component.loading).toBe(false);
    expect(component.pedido.METODO_PAGO).toBe('Nequi');
  });

  it('should handle error on load', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBe('Error al cargar el pedido');
    expect(component.loading).toBe(false);
  });

  it('should parse productos when provided as string/array', fakeAsync(() => {
    const productos = [
      { PRECIO_UNITARIO: 1000, CANTIDAD: 2 },
      { precio: 500, cantidad: 3 },
      { SUBTOTAL: 700 },
      { subtotal: 300 },
    ];
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({ data: { PK_ID_PEDIDO: 6, productos: JSON.stringify(productos) } }),
    );
    fixture.detectChanges();
    expect(Array.isArray(component.pedido.productos)).toBe(true);
    expect(component.pedido.productos.length).toBe(4);

    // Ahora como array
    pedidoService.getPedidoDetalles.mockReturnValue(of({ data: { PK_ID_PEDIDO: 7, productos } }));
    fixture.detectChanges();
    expect(Array.isArray(component.pedido.productos)).toBe(true);
    expect(component.pedido.productos.length).toBe(4);
  }));

  it('should ignore NaN subtotal values when computing total', fakeAsync(() => {
    const productos = [
      { SUBTOTAL: 'x' },
      { subtotal: null },
      { PRECIO_UNITARIO: 'not-num', CANTIDAD: 2 },
      { PRECIO_UNITARIO: 10, CANTIDAD: 2 },
    ];
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({ data: { PK_ID_PEDIDO: 11, productos: JSON.stringify(productos) } }),
    );
    component.ngOnInit();
    tick();
    expect(component.pedido.total).toBe(20);
  }));

  it('should set error when route id is invalid', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PedidoComponent],
      providers: [
        { provide: PedidoService, useValue: createPedidoServiceMock() },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();
    const fx = TestBed.createComponent(PedidoComponent);
    const cmp = fx.componentInstance;
    cmp.ngOnInit();
    expect(cmp.error).toBe('Pedido no encontrado');
    expect(cmp.loading).toBe(false);
  });

  it('should handle invalid productos JSON gracefully', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({ data: { PK_ID_PEDIDO: 8, productos: '{invalid json' } }),
    );
    fixture.detectChanges();
    expect(component.pedido.productos).toEqual([]);
  });

  it('should set loading false when response has no data (no error)', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(of({ data: null }));
    component.ngOnInit();
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.pedido).toBeUndefined();
  });

  it('should treat non-array productos as empty after parsing', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({ data: { PK_ID_PEDIDO: 12, productos: '{"k":1}' } }),
    );
    fixture.detectChanges();
    expect(component.pedido.productos).toEqual([]);
    expect(component.pedido.total).toBe(0);
  });

  it('should handle missing productos field as empty array', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(of({ data: { PK_ID_PEDIDO: 13 } }));
    fixture.detectChanges();
    expect(component.pedido.productos).toEqual([]);
    expect(component.pedido.total).toBe(0);
  });

  it('should default cantidad to 1 when missing and compute subtotal', () => {
    const productos = [{ PRECIO_UNITARIO: 15 }];
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({ data: { PK_ID_PEDIDO: 14, productos: JSON.stringify(productos) } }),
    );
    fixture.detectChanges();
    expect(component.pedido.productos).toEqual([{ PRECIO_UNITARIO: 15 }]);
    expect(component.pedido.total).toBe(15);
  });

  it('should compute subtotal via multiplication when subtotal missing', fakeAsync(() => {
    const productos = [
      { PRECIO_UNITARIO: 200, CANTIDAD: 2 },
      { precio: 50, cantidad: 3 },
    ];
    pedidoService.getPedidoDetalles.mockReturnValue(
      of({ data: { PK_ID_PEDIDO: 9, productos: JSON.stringify(productos) } }),
    );
    component.ngOnInit();
    tick();
    expect(component.pedido.total).toBe(200 * 2 + 50 * 3);
  }));
});
