import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { UserService } from '../../../../core/services/user.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ConsultarDomicilioComponent } from './consultar-domicilios.component';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { estadoPago } from '../../../../shared/constants';

describe('ConsultarDomicilioComponent', () => {
  let component: ConsultarDomicilioComponent;
  let fixture: ComponentFixture<ConsultarDomicilioComponent>;
  let domicilioService: any;
  let userService: any;
  let trabajadorService: any;
  let modalService: any;

  const createDomicilio = (overrides: Partial<Domicilio> = {}): Domicilio => ({
    fechaDomicilio: '2024-01-01',
    direccion: 'dir',
    telefono: 'tel',
    estadoPago: estadoPago.PAGADO,
    entregado: false,
    observaciones: '',
    createdBy: 'tester',
    ...overrides,
  });

  beforeEach(async () => {
    domicilioService = {
      getDomicilios: jest.fn(),
      asignarDomiciliario: jest.fn(),
      updateDomicilio: jest.fn(),
    };
    userService = { getUserId: jest.fn() };
    trabajadorService = {
      getTrabajadores: jest.fn(),
      searchTrabajador: jest.fn(),
    };
    modalService = {
      openModal: jest.fn(),
      getModalData: jest.fn(),
      closeModal: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ConsultarDomicilioComponent],
      providers: [
        { provide: DomicilioService, useValue: domicilioService },
        { provide: UserService, useValue: userService },
        { provide: TrabajadorService, useValue: trabajadorService },
        { provide: ModalService, useValue: modalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUserId on init', () => {
    component.ngOnInit();
    expect(userService.getUserId).toHaveBeenCalled();
  });

  it('should reset fields when search toggles are false', () => {
    component.direccion = 'a';
    component.telefono = 'b';
    component.fechaDomicilio = 'c';
    component.buscarPorDireccion = false;
    component.buscarPorTelefono = false;
    component.buscarPorFecha = false;

    component.actualizarTipoBusqueda();

    expect(component.direccion).toBe('');
    expect(component.telefono).toBe('');
    expect(component.fechaDomicilio).toBe('');
  });

  it('should not reset fields when search toggles are true', () => {
    component.direccion = 'a';
    component.telefono = 'b';
    component.fechaDomicilio = 'c';
    component.buscarPorDireccion = true;
    component.buscarPorTelefono = true;
    component.buscarPorFecha = true;

    component.actualizarTipoBusqueda();

    expect(component.direccion).toBe('a');
    expect(component.telefono).toBe('b');
    expect(component.fechaDomicilio).toBe('c');
  });

  it('should build params and load domicilios with worker names', () => {
    component.buscarPorDireccion = true;
    component.direccion = 'Calle';
    component.buscarPorTelefono = true;
    component.telefono = '123';
    component.buscarPorFecha = true;
    component.fechaDomicilio = '2024-01-01';

    const domicilios = [
      createDomicilio({ domicilioId: 1, trabajadorAsignado: 10 }),
      createDomicilio({ domicilioId: 2, trabajadorAsignado: 20 }),
      createDomicilio({ domicilioId: 3 }),
    ];

    domicilioService.getDomicilios.mockReturnValue(
      of({ code: 200, data: domicilios })
    );
    trabajadorService.searchTrabajador
      .mockReturnValueOnce(of({ data: { nombre: 'Juan', apellido: 'Pérez' } }))
      .mockReturnValueOnce(of(null));

    component.buscarDomicilios();

    expect(domicilioService.getDomicilios).toHaveBeenCalledWith({
      direccion: 'Calle',
      telefono: '123',
      fecha: '2024-01-01',
    });
    expect(trabajadorService.searchTrabajador).toHaveBeenNthCalledWith(1, 10);
    expect(trabajadorService.searchTrabajador).toHaveBeenNthCalledWith(2, 20);
    expect(component.domicilios[0].trabajadorNombre).toBe('Juan Pérez');
    expect(component.domicilios[1].trabajadorNombre).toBe('No asignado');
    expect(component.domicilios.length).toBe(3);
  });

  it('should show message when service returns error', () => {
    domicilioService.getDomicilios.mockReturnValue(
      of({ code: 500, message: 'error' })
    );

    component.buscarDomicilios();

    expect(component.mostrarMensaje).toBe(true);
    expect(component.mensaje).toBe('error');
  });

  it('should open modal and assign worker on accept', () => {
    const domicilio = createDomicilio({ domicilioId: 1 });
    trabajadorService.getTrabajadores.mockReturnValue(
      of([{ nombre: 'Ana', apellido: 'García', documentoTrabajador: 2 }])
    );
    modalService.getModalData.mockReturnValue({ select: { selected: 2 } });
    const confirmarSpy = jest
      .spyOn(component, 'confirmarAsignacion')
      .mockImplementation(() => {});

    component.asignarDomicilio(domicilio);
    const config = modalService.openModal.mock.calls[0][0];

    expect(config.select.options).toEqual([
      { label: 'Ana García', value: 2 },
    ]);

    config.buttons[0].action();
    expect(confirmarSpy).toHaveBeenCalledWith(domicilio, 2);
    expect(modalService.closeModal).toHaveBeenCalled();

    config.buttons[1].action();
    expect(modalService.closeModal).toHaveBeenCalledTimes(2);
  });

  it('should not assign when no worker selected', () => {
    const domicilio = createDomicilio({ domicilioId: 1 });
    trabajadorService.getTrabajadores.mockReturnValue(of([]));
    modalService.getModalData.mockReturnValue({ select: { selected: null } });
    const confirmarSpy = jest
      .spyOn(component, 'confirmarAsignacion')
      .mockImplementation(() => {});

    component.asignarDomicilio(domicilio);
    const config = modalService.openModal.mock.calls[0][0];

    config.buttons[0].action();
    expect(confirmarSpy).not.toHaveBeenCalled();
    expect(modalService.closeModal).not.toHaveBeenCalled();
  });

  it('should assign worker and set name on confirmarAsignacion', () => {
    const domicilio = createDomicilio({ domicilioId: 1 });
    domicilioService.asignarDomiciliario.mockReturnValue(of({ code: 200 }));
    trabajadorService.searchTrabajador.mockReturnValue(
      of({ data: { nombre: 'Ana', apellido: 'García' } })
    );

    component.confirmarAsignacion(domicilio, 5);

    expect(domicilioService.asignarDomiciliario).toHaveBeenCalledWith(1, 5);
    expect(domicilio.trabajadorAsignado).toBe(5);
    expect(domicilio.trabajadorNombre).toBe('Ana García');
  });

  it('should not set worker when confirmAsignacion fails', () => {
    const domicilio = createDomicilio({ domicilioId: 1 });
    domicilioService.asignarDomiciliario.mockReturnValue(of({ code: 400 }));

    component.confirmarAsignacion(domicilio, 5);

    expect(domicilio.trabajadorAsignado).toBeUndefined();
    expect(trabajadorService.searchTrabajador).not.toHaveBeenCalled();
  });

  it('should mark domicilio as delivered', () => {
    const domicilio = createDomicilio({ domicilioId: 1 });
    domicilioService.updateDomicilio.mockReturnValue(of({ code: 200 }));

    component.marcarEntregado(domicilio);

    expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, {
      entregado: true,
    });
    expect(domicilio.entregado).toBe(true);
  });

  it('should not mark domicilio when service fails', () => {
    const domicilio = createDomicilio({ domicilioId: 1 });
    domicilioService.updateDomicilio.mockReturnValue(of({ code: 400 }));

    component.marcarEntregado(domicilio);

    expect(domicilio.entregado).toBe(false);
  });

  it('should return correct count of active filters', () => {
    component.buscarPorDireccion = true;
    component.buscarPorTelefono = true;
    component.buscarPorFecha = false;
    expect(component.countFiltros()).toBe(2);
  });
});
