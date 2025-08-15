import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { UserService } from '../../../../core/services/user.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ConsultarDomicilioComponent } from './consultar-domicilios.component';

describe('ConsultarDomiciliosComponent', () => {
  let component: ConsultarDomicilioComponent;
  let fixture: ComponentFixture<ConsultarDomicilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarDomicilioComponent],
      providers: [
        { provide: DomicilioService, useValue: {} },
        { provide: UserService, useValue: { getUserId: () => {} } },
        { provide: TrabajadorService, useValue: {} },
        { provide: ModalService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return 1 when one filter is active', () => {
    component.buscarPorDireccion = true;
    component.buscarPorTelefono = false;
    component.buscarPorFecha = false;

    expect(component.countFiltros()).toBe(1);
  });

  it('should return 2 when two filters are active', () => {
    component.buscarPorDireccion = true;
    component.buscarPorTelefono = true;
    component.buscarPorFecha = false;

    expect(component.countFiltros()).toBe(2);
  });

  it('should return 3 when all filters are active', () => {
    component.buscarPorDireccion = true;
    component.buscarPorTelefono = true;
    component.buscarPorFecha = true;

    expect(component.countFiltros()).toBe(3);
  });
});
