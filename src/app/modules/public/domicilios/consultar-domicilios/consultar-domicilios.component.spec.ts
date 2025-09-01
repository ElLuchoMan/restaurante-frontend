import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { ModalService } from '../../../../core/services/modal.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoPago } from '../../../../shared/constants';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { ConsultarDomicilioComponent } from './consultar-domicilios.component';

describe('ConsultarDomicilioComponent', () => {
  let component: ConsultarDomicilioComponent;
  let fixture: ComponentFixture<ConsultarDomicilioComponent>;
  let domicilioService: jest.Mocked<DomicilioService>;
  let userService: jest.Mocked<UserService>;
  let trabajadorService: jest.Mocked<TrabajadorService>;
  let modalService: jest.Mocked<ModalService>;

  beforeEach(async () => {
    domicilioService = {
      getDomicilios: jest.fn(),
      asignarDomiciliario: jest.fn(),
      updateDomicilio: jest.fn(),
    } as any;
    userService = {
      getUserId: jest.fn(),
    } as any;
    trabajadorService = {
      searchTrabajador: jest.fn(),
      getTrabajadores: jest.fn(),
    } as any;
    modalService = {
      openModal: jest.fn(),
      getModalData: jest.fn(),
      closeModal: jest.fn(),
    } as any;

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

  it('should create and call getUserId on init', () => {
    expect(component).toBeTruthy();
    expect(userService.getUserId).toHaveBeenCalled();
  });

  describe('actualizarTipoBusqueda', () => {
    it('should not clear fields when filters are enabled', () => {
      component.buscarPorDireccion = true;
      component.buscarPorTelefono = true;
      component.buscarPorFecha = true;
      component.direccion = 'dir';
      component.telefono = 'tel';
      component.fechaDomicilio = 'fecha';

      component.actualizarTipoBusqueda();

      expect(component.direccion).toBe('dir');
      expect(component.telefono).toBe('tel');
      expect(component.fechaDomicilio).toBe('fecha');
    });

    it('should clear fields when filters are disabled', () => {
      component.buscarPorDireccion = false;
      component.buscarPorTelefono = false;
      component.buscarPorFecha = false;
      component.direccion = 'dir';
      component.telefono = 'tel';
      component.fechaDomicilio = 'fecha';

      component.actualizarTipoBusqueda();

      expect(component.direccion).toBe('');
      expect(component.telefono).toBe('');
      expect(component.fechaDomicilio).toBe('');
    });
  });

  describe('buscarDomicilios', () => {
    it('should load domicilios and worker names on success', () => {
      component.buscarPorDireccion = true;
      component.buscarPorTelefono = true;
      component.buscarPorFecha = true;
      component.direccion = 'dir';
      component.telefono = '123';
      component.fechaDomicilio = '2024-01-01';

      const domicilios: Domicilio[] = [
        {
          fechaDomicilio: '',
          direccion: 'dir',
          telefono: '123',
          estadoPago: estadoPago.PAGADO,
          entregado: false,
          observaciones: '',
          createdBy: '',
          trabajadorAsignado: 10,
          domicilioId: 1,
        },
        {
          fechaDomicilio: '',
          direccion: 'dir2',
          telefono: '456',
          estadoPago: estadoPago.PAGADO,
          entregado: false,
          observaciones: '',
          createdBy: '',
          trabajadorAsignado: 20,
          domicilioId: 2,
        },
        {
          fechaDomicilio: '',
          direccion: 'dir3',
          telefono: '789',
          estadoPago: estadoPago.PAGADO,
          entregado: false,
          observaciones: '',
          createdBy: '',
          domicilioId: 3,
        },
      ];

      domicilioService.getDomicilios.mockReturnValue(of({ code: 200, data: domicilios }));
      trabajadorService.searchTrabajador.mockImplementation((id: number) =>
        id === 10 ? of({ data: { nombre: 'Juan', apellido: 'Pérez' } }) : of(null),
      );

      component.buscarDomicilios();

      expect(domicilioService.getDomicilios).toHaveBeenCalledWith({
        direccion: 'dir',
        telefono: '123',
        fecha: '2024-01-01',
      });
      expect(trabajadorService.searchTrabajador).toHaveBeenCalledTimes(2);
      expect(component.domicilios[0].trabajadorNombre).toBe('Juan Pérez');
      expect(component.domicilios[1].trabajadorNombre).toBe('No asignado');
      expect(component.mostrarMensaje).toBe(false);
    });

    it('should show message on error response', () => {
      component.buscarPorDireccion = false;
      component.buscarPorTelefono = false;
      component.buscarPorFecha = false;
      component.direccion = 'dir';
      component.telefono = '123';
      component.fechaDomicilio = '2024-01-01';

      domicilioService.getDomicilios.mockReturnValue(of({ code: 400, message: 'Error' }));

      component.buscarDomicilios();

      expect(domicilioService.getDomicilios).toHaveBeenCalledWith({});
      expect(component.mostrarMensaje).toBe(true);
      expect(component.mensaje).toBe('Error');
      expect(trabajadorService.searchTrabajador).not.toHaveBeenCalled();
    });
  });

  describe('asignarDomicilio', () => {
    const domicilioBase: Domicilio = {
      fechaDomicilio: '',
      direccion: 'dir',
      telefono: '123',
      estadoPago: estadoPago.PAGADO,
      entregado: false,
      observaciones: '',
      createdBy: '',
      domicilioId: 1,
    };

    it('should open modal and confirm selection', () => {
      trabajadorService.getTrabajadores.mockReturnValue(
        of([{ nombre: 'A', apellido: 'B', documentoTrabajador: 1 }]),
      );
      let modalConfig: any;
      modalService.openModal.mockImplementation((config) => (modalConfig = config));
      modalService.getModalData.mockReturnValue({ select: { selected: 1 } });
      jest.spyOn(component, 'confirmarAsignacion');
      domicilioService.asignarDomiciliario.mockReturnValue(of({ code: 200 }));
      trabajadorService.searchTrabajador.mockReturnValue(
        of({ data: { nombre: 'A', apellido: 'B' } }),
      );

      component.asignarDomicilio(domicilioBase);

      expect(trabajadorService.getTrabajadores).toHaveBeenCalled();
      expect(modalService.openModal).toHaveBeenCalled();
      modalConfig.buttons[0].action();
      modalConfig.buttons[1].action();
      expect(component.confirmarAsignacion).toHaveBeenCalledWith(domicilioBase, 1);
      expect(modalService.closeModal).toHaveBeenCalledTimes(2);
    });

    it('should not confirm when no worker selected', () => {
      trabajadorService.getTrabajadores.mockReturnValue(
        of([{ nombre: 'A', apellido: 'B', documentoTrabajador: 1 }]),
      );
      let modalConfig: any;
      modalService.openModal.mockImplementation((config) => (modalConfig = config));
      modalService.getModalData.mockReturnValue({ select: { selected: null } });
      jest.spyOn(component, 'confirmarAsignacion');

      component.asignarDomicilio(domicilioBase);

      modalConfig.buttons[0].action();
      expect(component.confirmarAsignacion).not.toHaveBeenCalled();
      expect(modalService.closeModal).not.toHaveBeenCalled();
    });
  });

  describe('confirmarAsignacion', () => {
    it('should update trabajador info when service returns 200', () => {
      const domicilio: Domicilio = {
        fechaDomicilio: '',
        direccion: 'dir',
        telefono: '123',
        estadoPago: estadoPago.PAGADO,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.asignarDomiciliario.mockReturnValue(of({ code: 200 }));
      trabajadorService.searchTrabajador.mockReturnValue(
        of({ data: { nombre: 'Ana', apellido: 'Gómez' } }),
      );

      component.confirmarAsignacion(domicilio, 5);

      expect(domicilioService.asignarDomiciliario).toHaveBeenCalledWith(1, 5);
      expect(trabajadorService.searchTrabajador).toHaveBeenCalledWith(5);
      expect(domicilio.trabajadorAsignado).toBe(5);
      expect(domicilio.trabajadorNombre).toBe('Ana Gómez');
    });

    it('should not update when service returns error code', () => {
      const domicilio: Domicilio = {
        fechaDomicilio: '',
        direccion: 'dir',
        telefono: '123',
        estadoPago: estadoPago.PAGADO,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.asignarDomiciliario.mockReturnValue(of({ code: 500 }));

      component.confirmarAsignacion(domicilio, 5);

      expect(trabajadorService.searchTrabajador).not.toHaveBeenCalled();
      expect(domicilio.trabajadorAsignado).toBeUndefined();
      expect(domicilio.trabajadorNombre).toBeUndefined();
    });
  });

  describe('countFiltros', () => {
    it('should return 0 when no filter is active', () => {
      component.buscarPorDireccion = false;
      component.buscarPorTelefono = false;
      component.buscarPorFecha = false;
      expect(component.countFiltros()).toBe(0);
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

  describe('marcarEntregado', () => {
    it('should set entregado when service returns 200', () => {
      const domicilio: Domicilio = {
        fechaDomicilio: '',
        direccion: 'dir',
        telefono: '123',
        estadoPago: estadoPago.PAGADO,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.updateDomicilio.mockReturnValue(of({ code: 200 }));

      component.marcarEntregado(domicilio);

      expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, { entregado: true });
      expect(domicilio.entregado).toBe(true);
    });

    it('should not set entregado when service returns error code', () => {
      const domicilio: Domicilio = {
        fechaDomicilio: '',
        direccion: 'dir',
        telefono: '123',
        estadoPago: estadoPago.PAGADO,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.updateDomicilio.mockReturnValue(of({ code: 500 }));

      component.marcarEntregado(domicilio);

      expect(domicilio.entregado).toBe(false);
    });
  });
});
