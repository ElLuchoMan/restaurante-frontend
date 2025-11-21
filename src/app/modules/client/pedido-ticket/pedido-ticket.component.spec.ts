import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { PedidoTicketComponent } from './pedido-ticket.component';

describe('PedidoTicketComponent', () => {
  let component: PedidoTicketComponent;
  let fixture: ComponentFixture<PedidoTicketComponent>;

  const mockPedido = {
    pedidoId: 123,
    fechaPedido: '20-11-2023',
    horaPedido: '12:30:00',
    delivery: true,
    estadoPedido: 'EN_CAMINO',
    metodoPago: 'Efectivo',
    total: 25000,
    productos: [
      {
        NOMBRE: 'Hamburguesa',
        CANTIDAD: 2,
        PRECIO_UNITARIO: 10000,
        SUBTOTAL: 20000,
      },
      {
        nombre: 'Gaseosa',
        cantidad: 1,
        precio: 5000,
        subtotal: 5000,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoTicketComponent, FormatDatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoTicketComponent);
    component = fixture.componentInstance;
    component.pedido = mockPedido;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display order details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.estado-title')?.textContent).toContain('En Camino');
    expect(compiled.querySelector('.delivery-badge')?.textContent).toContain('Envío a Domicilio');
    expect(compiled.querySelector('.stamp-amount')?.textContent).toContain('25,000');
  });

  it('should return correct status class', () => {
    expect(component.getEstadoClass('TERMINADO')).toBe('success');
    expect(component.getEstadoClass('CANCELADO')).toBe('danger');
    expect(component.getEstadoClass('UNKNOWN')).toBe('default');
  });

  it('should return correct status icon', () => {
    expect(component.getEstadoIcon('TERMINADO')).toBe('fa-check-circle');
    expect(component.getEstadoIcon('CANCELADO')).toBe('fa-times-circle');
    expect(component.getEstadoIcon('UNKNOWN')).toBe('fa-info-circle');
  });

  it('should return correct status label', () => {
    expect(component.getEstadoLabel('TERMINADO')).toBe('Terminado');
    expect(component.getEstadoLabel('PREPARACION')).toBe('En Preparación');
    expect(component.getEstadoLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});
