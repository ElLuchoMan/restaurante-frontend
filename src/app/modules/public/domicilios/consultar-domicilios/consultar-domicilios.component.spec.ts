import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { ModalService } from '../../../../core/services/modal.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoDomicilio } from '../../../../shared/constants';
import {
  createDomicilioServiceMock,
  createModalServiceMock,
  createTrabajadorServiceMock,
  createUserServiceMock,
} from '../../../../shared/mocks/test-doubles';
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
    domicilioService = createDomicilioServiceMock() as any;
    userService = createUserServiceMock() as any;
    trabajadorService = createTrabajadorServiceMock() as any;
    modalService = createModalServiceMock() as any;

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
          estadoDomicilio: estadoDomicilio.PENDIENTE,
          entregado: false,
          observaciones: '',
          createdBy: '',
          trabajadorAsignado: { documentoTrabajador: 10 },
          domicilioId: 1,
        },
        {
          fechaDomicilio: '',
          direccion: 'dir2',
          telefono: '456',
          estadoDomicilio: estadoDomicilio.PENDIENTE,
          entregado: false,
          observaciones: '',
          createdBy: '',
          trabajadorAsignado: { documentoTrabajador: 20 },
          domicilioId: 2,
        },
        {
          fechaDomicilio: '',
          direccion: 'dir3',
          telefono: '789',
          estadoDomicilio: estadoDomicilio.PENDIENTE,
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

    it('should show message on HTTP error', () => {
      domicilioService.getDomicilios.mockReturnValue(
        throwError(() => ({ code: 400, message: 'Error' })),
      );
      component.domicilios = [{ domicilioId: 9 } as Domicilio];

      component.buscarDomicilios();

      expect(domicilioService.getDomicilios).toHaveBeenCalledWith({});
      expect(component.domicilios).toEqual([]);
      expect(component.mostrarMensaje).toBe(true);
      expect(component.mensaje).toBe('Error');
      expect(trabajadorService.searchTrabajador).not.toHaveBeenCalled();
    });

    it('should show "No asignado" when the trabajador lookup fails (403 for non-admins)', () => {
      domicilioService.getDomicilios.mockReturnValue(
        of({
          code: 200,
          message: 'ok',
          data: [{ domicilioId: 1, trabajadorAsignado: { documentoTrabajador: 10 } } as Domicilio],
        }),
      );
      trabajadorService.searchTrabajador.mockReturnValue(throwError(() => ({ code: 403 })));

      component.buscarDomicilios();

      expect(component.domicilios[0].trabajadorNombre).toBe('No asignado');
    });

    it('should show default message when the HTTP error has no message', () => {
      domicilioService.getDomicilios.mockReturnValue(throwError(() => undefined));

      component.buscarDomicilios();

      expect(component.mensaje).toBe('No se pudieron consultar los domicilios');
    });

    it('should show message when the list comes empty (200 with data [])', () => {
      domicilioService.getDomicilios.mockReturnValue(
        of({ code: 200, message: 'ok', data: [] as Domicilio[] }),
      );

      component.buscarDomicilios();

      expect(component.domicilios).toEqual([]);
      expect(component.mostrarMensaje).toBe(true);
      expect(component.mensaje).toBe('No se encontraron domicilios');
    });
  });

  describe('asignarDomicilio', () => {
    const domicilioBase: Domicilio = {
      fechaDomicilio: '',
      direccion: 'dir',
      telefono: '123',
      estadoDomicilio: estadoDomicilio.PENDIENTE,
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
        estadoDomicilio: estadoDomicilio.PENDIENTE,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.asignarDomiciliario.mockReturnValue(
        of({
          code: 200,
          message: 'ok',
          data: {
            ...domicilio,
            estadoDomicilio: estadoDomicilio.EN_CAMINO,
            trabajadorAsignado: { documentoTrabajador: 5 },
          },
        }),
      );
      trabajadorService.searchTrabajador.mockReturnValue(
        of({ data: { nombre: 'Ana', apellido: 'Gómez' } }),
      );

      component.confirmarAsignacion(domicilio, 5);

      expect(domicilioService.asignarDomiciliario).toHaveBeenCalledWith(1, 5);
      expect(trabajadorService.searchTrabajador).toHaveBeenCalledWith(5);
      expect(domicilio.trabajadorAsignado).toEqual({ documentoTrabajador: 5 });
      expect(domicilio.estadoDomicilio).toBe(estadoDomicilio.EN_CAMINO);
      expect(domicilio.trabajadorNombre).toBe('Ana Gómez');
    });

    it('should show "No asignado" when the trabajador lookup comes without data (code 404)', () => {
      const domicilio: Domicilio = {
        fechaDomicilio: '',
        direccion: 'dir',
        telefono: '123',
        estadoDomicilio: estadoDomicilio.PENDIENTE,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.asignarDomiciliario.mockReturnValue(
        of({
          code: 200,
          message: 'ok',
          data: { ...domicilio, trabajadorAsignado: { documentoTrabajador: 5 } },
        }),
      );
      trabajadorService.searchTrabajador.mockReturnValue(
        of({ code: 404, message: 'Trabajador no encontrado' }),
      );

      component.confirmarAsignacion(domicilio, 5);

      expect(domicilio.trabajadorNombre).toBe('No asignado');
      expect(domicilio.trabajadorAsignado).toBeTruthy();
    });

    it('should show "No asignado" when the trabajador lookup fails after asignar', () => {
      const domicilio = { domicilioId: 1 } as Domicilio;
      domicilioService.asignarDomiciliario.mockReturnValue(
        of({ code: 200, message: 'ok', data: domicilio }),
      );
      trabajadorService.searchTrabajador.mockReturnValue(throwError(() => ({ code: 403 })));

      component.confirmarAsignacion(domicilio, 5);

      expect(domicilio.trabajadorNombre).toBe('No asignado');
    });

    it('should show the error message when asignar fails (404/409)', () => {
      const domicilio: Domicilio = {
        fechaDomicilio: '',
        direccion: 'dir',
        telefono: '123',
        estadoDomicilio: estadoDomicilio.PENDIENTE,
        entregado: false,
        observaciones: '',
        createdBy: '',
        domicilioId: 1,
      };

      domicilioService.asignarDomiciliario.mockReturnValue(
        throwError(() => ({ code: 409, message: 'Ya asignado' })),
      );

      component.confirmarAsignacion(domicilio, 5);

      expect(trabajadorService.searchTrabajador).not.toHaveBeenCalled();
      expect(domicilio.trabajadorAsignado).toBeUndefined();
      expect(component.mostrarMensaje).toBe(true);
      expect(component.mensaje).toBe('Ya asignado');
    });

    it('should use a default message when asignar fails without message', () => {
      domicilioService.asignarDomiciliario.mockReturnValue(throwError(() => undefined));

      component.confirmarAsignacion({ domicilioId: 1 } as Domicilio, 5);

      expect(component.mensaje).toBe('No se pudo asignar el domicilio');
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
    const domicilio = (): Domicilio => ({
      fechaDomicilio: '',
      direccion: 'dir',
      telefono: '123',
      estadoDomicilio: estadoDomicilio.EN_CAMINO,
      entregado: false,
      observaciones: '',
      createdBy: '',
      domicilioId: 1,
    });

    it('should send estado ENTREGADO and reflect the returned domicilio', () => {
      const d = domicilio();
      userService.getUserId.mockReturnValue(7);
      domicilioService.updateDomicilio.mockReturnValue(
        of({
          code: 200,
          message: 'ok',
          data: { ...d, estadoDomicilio: estadoDomicilio.ENTREGADO, entregado: true },
        }),
      );

      component.marcarEntregado(d);

      expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, {
        estado: estadoDomicilio.ENTREGADO,
        updatedBy: 'Usuario 7',
      });
      expect(d.entregado).toBe(true);
      expect(d.estadoDomicilio).toBe(estadoDomicilio.ENTREGADO);
    });

    it('should not set entregado and show the message when the service fails', () => {
      const d = domicilio();
      domicilioService.updateDomicilio.mockReturnValue(
        throwError(() => ({ code: 404, message: 'Domicilio no encontrado' })),
      );

      component.marcarEntregado(d);

      expect(d.entregado).toBe(false);
      expect(component.mostrarMensaje).toBe(true);
      expect(component.mensaje).toBe('Domicilio no encontrado');
    });

    it('should use a default message when the failure has no message', () => {
      domicilioService.updateDomicilio.mockReturnValue(throwError(() => undefined));

      component.marcarEntregado(domicilio());

      expect(component.mensaje).toBe('No se pudo marcar el domicilio como entregado');
    });
  });
});
