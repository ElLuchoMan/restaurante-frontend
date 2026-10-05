import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { PrecioProductoHistService } from '../../../../core/services/precio-producto-hist.service';
import { mockPrecioProductoHistList } from '../../../../shared/mocks/precio-producto-hist.mock';
import { createPrecioProductoHistServiceMock } from '../../../../shared/mocks/test-doubles';
import { HistoricoPreciosComponent } from './historico-precios.component';

describe('HistoricoPreciosComponent', () => {
  let component: HistoricoPreciosComponent;
  let fixture: ComponentFixture<HistoricoPreciosComponent>;
  let mockPrecioProductoHistService: jest.Mocked<PrecioProductoHistService>;

  beforeEach(async () => {
    mockPrecioProductoHistService = createPrecioProductoHistServiceMock() as any;

    await TestBed.configureTestingModule({
      imports: [HistoricoPreciosComponent, FormsModule],
      providers: [
        {
          provide: PrecioProductoHistService,
          useValue: mockPrecioProductoHistService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoPreciosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería cargar el histórico al inicializar', () => {
      mockPrecioProductoHistService.list.mockReturnValue(of(mockPrecioProductoHistList));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockPrecioProductoHistService.list).toHaveBeenCalled();
      expect(component.historico).toEqual(mockPrecioProductoHistList.data);
      expect(component.historicoFiltrado).toEqual(mockPrecioProductoHistList.data);
      expect(component.cargando).toBe(false);
    });

    it('debería manejar error al cargar el histórico', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPrecioProductoHistService.list.mockReturnValue(
        throwError(() => new Error('Error al cargar')),
      );

      fixture.detectChanges();

      expect(component.error).toBe('Error al cargar el histórico de precios');
      expect(component.cargando).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('debería manejar respuesta con code diferente de 200', () => {
      mockPrecioProductoHistService.list.mockReturnValue(
        of({ code: 500, message: 'Error del servidor', data: [] }),
      );

      fixture.detectChanges();

      expect(component.error).toBe('Error del servidor');
      expect(component.cargando).toBe(false);
    });
  });

  describe('cargarHistorico', () => {
    it('debería cargar el histórico exitosamente', () => {
      mockPrecioProductoHistService.list.mockReturnValue(of(mockPrecioProductoHistList));

      component.cargarHistorico();

      expect(component.historico).toEqual(mockPrecioProductoHistList.data);
      expect(component.historicoFiltrado).toEqual(mockPrecioProductoHistList.data);
      expect(component.cargando).toBe(false);
    });
  });

  describe('aplicarFiltros', () => {
    beforeEach(() => {
      component.historico = mockPrecioProductoHistList.data!;
      component.historicoFiltrado = [...mockPrecioProductoHistList.data!];
    });

    it('debería filtrar por ID de producto', () => {
      component.filtroProductoId = '1';
      component.aplicarFiltros();

      expect(component.historicoFiltrado.length).toBe(2);
      expect(component.historicoFiltrado.every((item) => item.productoId === 1)).toBe(true);
    });

    it('debería filtrar por nombre de producto', () => {
      component.filtroNombre = 'coca';
      component.aplicarFiltros();

      expect(component.historicoFiltrado.length).toBe(2);
      expect(
        component.historicoFiltrado.every((item) => item.nombre?.toLowerCase().includes('coca')),
      ).toBe(true);
    });

    it('debería filtrar por fecha', () => {
      component.filtroFecha = '2024-01-01';
      component.aplicarFiltros();

      expect(component.historicoFiltrado.length).toBe(2);
      expect(
        component.historicoFiltrado.every((item) => item.fechaVigencia.includes('2024-01-01')),
      ).toBe(true);
    });

    it('debería aplicar múltiples filtros', () => {
      component.filtroProductoId = '1';
      component.filtroFecha = '2024-01-01';
      component.aplicarFiltros();

      expect(component.historicoFiltrado.length).toBe(1);
      expect(component.historicoFiltrado[0].productoId).toBe(1);
      expect(component.historicoFiltrado[0].fechaVigencia).toBe('2024-01-01');
    });

    it('debería mostrar todos los registros si no hay filtros', () => {
      component.filtroProductoId = '';
      component.filtroNombre = '';
      component.filtroFecha = '';
      component.aplicarFiltros();

      expect(component.historicoFiltrado.length).toBe(mockPrecioProductoHistList.data!.length);
    });
  });

  describe('limpiarFiltros', () => {
    it('debería limpiar todos los filtros y mostrar todos los registros', () => {
      component.historico = mockPrecioProductoHistList.data!;
      component.filtroProductoId = '1';
      component.filtroNombre = 'test';
      component.filtroFecha = '2024-01-01';
      component.historicoFiltrado = [];

      component.limpiarFiltros();

      expect(component.filtroProductoId).toBe('');
      expect(component.filtroNombre).toBe('');
      expect(component.filtroFecha).toBe('');
      expect(component.historicoFiltrado).toEqual(mockPrecioProductoHistList.data);
    });
  });

  describe('formatearPrecio', () => {
    it('debería formatear el precio correctamente', () => {
      const precio = component.formatearPrecio(2000);
      expect(precio).toContain('2.000');
      expect(precio).toContain('$');
    });

    it('debería manejar precios grandes', () => {
      const precio = component.formatearPrecio(1000000);
      expect(precio).toContain('1.000.000');
    });
  });

  describe('formatearFecha', () => {
    it('debería formatear la fecha correctamente', () => {
      const fecha = component.formatearFecha('2024-01-15');
      expect(fecha).toContain('2024');
      expect(fecha.length).toBeGreaterThan(0);
    });

    it('debería manejar diferentes formatos de fecha', () => {
      const fecha = component.formatearFecha('2024-12-31');
      expect(fecha).toContain('2024');
    });

    it('debería manejar fechas vacías', () => {
      const fecha = component.formatearFecha('');
      expect(fecha).toBe('Fecha no disponible');
    });

    it('debería manejar fechas inválidas', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fecha = component.formatearFecha('fecha-invalida');
      expect(fecha).toBe('Fecha inválida');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('debería manejar fechas null o undefined', () => {
      const fecha = component.formatearFecha(null as any);
      expect(fecha).toBe('Fecha no disponible');
    });
  });
});
