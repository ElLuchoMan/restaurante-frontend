import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { convertToParamMap, ActivatedRoute } from '@angular/router';

import { PedidoComponent } from './pedido.component';
import { PedidoService } from '../../../core/services/pedido.service';

describe('PedidoComponent', () => {
  let component: PedidoComponent;
  let fixture: ComponentFixture<PedidoComponent>;
  let pedidoService: { getPedidoDetalles: jest.Mock };

  beforeEach(async () => {
    pedidoService = { getPedidoDetalles: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [PedidoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pedido on init', () => {
    pedidoService.getPedidoDetalles.mockReturnValue(of({ data: { PK_ID_PEDIDO: 5, PRODUCTOS: '[]', METODO_PAGO: 'Nequi', FECHA: '01-01-2024', HORA: '0000-01-01 10:00:00 +0000 UTC', DELIVERY: true, ESTADO_PEDIDO: 'TERMINADO' } }));
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
});
