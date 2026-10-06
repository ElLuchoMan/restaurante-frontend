import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoReserva } from '../../../../shared/constants';
import {
  mockReserva,
  mockReservaConsulta,
  mockReservasDelDiaResponse,
  mockReservasUnordered,
} from '../../../../shared/mocks/reserva.mocks';
import {
  createLoggingServiceMock,
  createReservaServiceMock,
  createToastrMock,
  createUserServiceMock,
} from '../../../../shared/mocks/test-doubles';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { ReservaBase } from '../../../../shared/models/reserva.model';
import { ConsultarReservaComponent } from './consultar-reserva.component';

const respuesta = (data: ReservaBase[]): ApiResponse<ReservaBase[]> => ({
  code: 200,
  message: 'Reservas obtenidas exitosamente',
  data,
});

describe('ConsultarReservaComponent', () => {
  let component: ConsultarReservaComponent;
  let fixture: ComponentFixture<ConsultarReservaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let toastr: jest.Mocked<ToastrService>;
  let userService: jest.Mocked<UserService>;
  let logger: jest.Mocked<LoggingService>;

  async function crear(rol: string | null, userId: number | null): Promise<void> {
    userService.getUserRole.mockReturnValue(rol);
    userService.getUserId.mockReturnValue(userId);
    fixture = TestBed.createComponent(ConsultarReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarReservaComponent, FormsModule, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: ReservaService, useValue: createReservaServiceMock() },
        { provide: ToastrService, useValue: createToastrMock() },
        { provide: UserService, useValue: createUserServiceMock() },
        { provide: LoggingService, useValue: createLoggingServiceMock() },
      ],
    }).compileComponents();

    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    logger = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;
  });

  describe('como administrador', () => {
    beforeEach(async () => {
      await crear('Administrador', 123456);
    });

    it('muestra los filtros y no busca al iniciar', () => {
      expect(component.esAdmin).toBe(true);
      expect(component.mostrarFiltros).toBe(true);
      expect(component.buscarPorDocumento).toBe(false);
      expect(reservaService.getReservasByDocumento).not.toHaveBeenCalled();
    });

    it('actualizarTipoBusqueda limpia resultados si no hay criterios y los conserva si hay', () => {
      component.reservas = [mockReserva];
      component.mostrarMensaje = true;
      component.buscarPorFecha = true;
      component.actualizarTipoBusqueda();
      expect(component.reservas).toHaveLength(1);

      component.buscarPorFecha = false;
      component.actualizarTipoBusqueda();
      expect(component.reservas).toEqual([]);
      expect(component.mostrarMensaje).toBe(false);
    });

    it('advierte si no hay criterio de búsqueda', () => {
      component.buscarReserva();
      expect(toastr.warning).toHaveBeenCalledWith(
        'Selecciona al menos un criterio de búsqueda',
        'Atención',
      );
    });

    it('advierte si falta el documento', () => {
      component.buscarPorDocumento = true;
      component.documentoCliente = '';
      component.buscarReserva();
      expect(toastr.warning).toHaveBeenCalledWith('Por favor ingresa un documento', 'Atención');
    });

    it('rechaza un documento no numérico', () => {
      component.buscarPorDocumento = true;
      component.buscarReserva('abc');
      expect(toastr.error).toHaveBeenCalledWith('El documento debe ser un número válido', 'Error');
      expect(reservaService.getReservasByDocumento).not.toHaveBeenCalled();
    });

    it('advierte si falta la fecha', () => {
      component.buscarPorFecha = true;
      component.fechaReserva = '';
      component.buscarReserva();
      expect(toastr.warning).toHaveBeenCalledWith('Por favor selecciona una fecha', 'Atención');
    });

    it('advierte "documento requerido" cuando el documento es 0', () => {
      component.buscarPorDocumento = true;
      component.buscarReserva(0);
      expect(toastr.warning).toHaveBeenCalledWith(
        'Documento requerido para la búsqueda',
        'Atención',
      );
    });

    it('busca por documento usando el valor del campo y ordena de más reciente a más antigua', () => {
      reservaService.getReservasByDocumento.mockReturnValue(of(respuesta(mockReservasUnordered)));
      component.buscarPorDocumento = true;
      component.documentoCliente = ' 1015466495 ';

      component.buscarReserva();

      expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(1015466495, undefined);
      // 02-01 16:00, luego 01-01 18:00 y 01-01 14:00
      expect(component.reservas.map((r) => r.reservaId)).toEqual([2, 3, 1]);
      expect(component.mostrarMensaje).toBe(true);
      // la lista original no se muta
      expect(mockReservasUnordered.map((r) => r.reservaId)).toEqual([1, 2, 3]);
    });

    it('busca por documento recibido por parámetro y fecha, sin consultar contactos', () => {
      reservaService.getReservasByDocumento.mockReturnValue(of(respuesta([])));
      component.buscarPorDocumento = true;
      component.buscarPorFecha = true;
      component.fechaReserva = '2025-02-06';

      component.buscarReserva(555);

      expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(555, '2025-02-06');
      expect(component.reservas).toEqual([]);
      expect(component.mostrarMensaje).toBe(true);
    });

    it('busca solo por fecha con getReservaByParameter', () => {
      reservaService.getReservaByParameter.mockReturnValue(of(mockReservasDelDiaResponse));
      component.buscarPorFecha = true;
      component.fechaReserva = '2025-02-06';

      component.buscarReserva();

      expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(undefined, '2025-02-06');
      expect(component.reservas).toHaveLength(2);
      expect(component.mostrarMensaje).toBe(true);
    });

    it('muestra error si la búsqueda falla', () => {
      reservaService.getReservasByDocumento.mockReturnValue(throwError(() => new Error('x')));
      component.buscarPorDocumento = true;
      component.buscarReserva(1);
      expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al buscar la reserva', 'Error');
      expect(component.mostrarMensaje).toBe(false);
    });

    it('renderiza nombre y teléfono desde el contacto embebido en la reserva', () => {
      component.reservas = [mockReserva];
      fixture.detectChanges();
      const html: string = fixture.nativeElement.textContent;
      expect(html).toContain('Carlos Perez');
      expect(html).toContain('3216549870');
    });

    describe('cambios de estado', () => {
      const actualizada: ReservaBase = { ...mockReserva, estadoReserva: estadoReserva.CONFIRMADA };

      beforeEach(() => {
        component.reservas = [mockReserva, { ...mockReserva, reservaId: 2 }];
        reservaService.actualizarReserva.mockReturnValue(
          of({ code: 200, message: 'ok', data: actualizada }),
        );
      });

      it('confirmar envía solo el estado y reemplaza la reserva con la respuesta', async () => {
        component.confirmarReserva(mockReserva);
        await fixture.whenStable();

        expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, {
          estadoReserva: estadoReserva.CONFIRMADA,
        });
        expect(toastr.success).toHaveBeenCalledWith(
          'Reserva marcada como CONFIRMADA',
          'Actualización Exitosa',
        );
        expect(component.reservas[0]).toBe(actualizada);
        expect(component.reservas[1].reservaId).toBe(2);
      });

      it('cancelar y cumplir usan el estado correspondiente', async () => {
        component.cancelarReserva(mockReserva);
        component.cumplirReserva(mockReserva);
        await fixture.whenStable();
        expect(reservaService.actualizarReserva).toHaveBeenNthCalledWith(1, 1, {
          estadoReserva: estadoReserva.CANCELADA,
        });
        expect(reservaService.actualizarReserva).toHaveBeenNthCalledWith(2, 1, {
          estadoReserva: estadoReserva.CUMPLIDA,
        });
      });

      it('rechaza un id de reserva no válido', () => {
        component.confirmarReserva({ ...mockReserva, reservaId: NaN });
        component.confirmarReserva({ ...mockReserva, reservaId: 0 });
        expect(toastr.error).toHaveBeenCalledWith('Error: ID de reserva no válido', 'Error');
        expect(reservaService.actualizarReserva).not.toHaveBeenCalled();
      });

      it('registra el error y avisa si el backend rechaza el cambio', () => {
        const error = { code: 404, message: 'Reserva no encontrada' };
        reservaService.actualizarReserva.mockReturnValue(throwError(() => error));
        component.confirmarReserva(mockReserva);
        expect(logger.log).toHaveBeenCalledWith(LogLevel.ERROR, 'Error:', error);
        expect(toastr.error).toHaveBeenCalledWith(
          'Ocurrió un error al actualizar la reserva',
          'Error',
        );
        expect(component.reservas[0]).toBe(mockReserva);
      });
    });
  });

  describe('como cliente', () => {
    it('carga solo sus reservas (el documento sale del token) y no muestra filtros', async () => {
      reservaService.getMisReservas.mockReturnValue(of(respuesta(mockReservasUnordered)));
      await crear('Cliente', 1015466495);

      expect(component.esCliente).toBe(true);
      expect(component.esAdmin).toBe(false);
      expect(component.esInvitado).toBe(false);
      expect(component.mostrarFiltros).toBe(false);
      expect(reservaService.getMisReservas).toHaveBeenCalledWith();
      expect(reservaService.getReservasByDocumento).not.toHaveBeenCalled();
      expect(component.reservas.map((r) => r.reservaId)).toEqual([2, 3, 1]);
      expect(component.mostrarMensaje).toBe(true);
      expect(fixture.nativeElement.textContent).toContain('Mis reservas');
    });

    it('avisa si falla la carga de sus reservas', async () => {
      reservaService.getMisReservas.mockReturnValue(throwError(() => new Error('x')));
      await crear('Cliente', 77);
      expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al buscar la reserva', 'Error');
      expect(component.mostrarMensaje).toBe(false);
    });

    it('un cliente no puede cambiar el estado de una reserva', async () => {
      reservaService.getMisReservas.mockReturnValue(of(respuesta([])));
      await crear('Cliente', 77);
      component.confirmarReserva(mockReserva);
      expect(reservaService.actualizarReserva).not.toHaveBeenCalled();
    });
  });

  describe('como personal no administrador', () => {
    it('ve los filtros y no consulta nada al iniciar', async () => {
      await crear('Mesero', 5);
      expect(component.esAdmin).toBe(false);
      expect(component.esInvitado).toBe(false);
      expect(component.esCliente).toBe(false);
      expect(component.mostrarFiltros).toBe(true);
      expect(reservaService.getMisReservas).not.toHaveBeenCalled();
    });
  });

  describe('como invitado (sin sesión)', () => {
    beforeEach(async () => {
      await crear(null, null);
    });

    it('muestra el formulario de consulta y nunca el listado ni los filtros', () => {
      expect(component.esInvitado).toBe(true);
      expect(component.mostrarFiltros).toBe(false);
      expect(reservaService.getMisReservas).not.toHaveBeenCalled();
      expect(reservaService.getReservasByDocumento).not.toHaveBeenCalled();
      expect(reservaService.getReservaByParameter).not.toHaveBeenCalled();
      const html: string = fixture.nativeElement.textContent;
      expect(html).toContain('Consultar mi reserva');
      expect(fixture.nativeElement.querySelector('#reservaIdConsulta')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#busquedaDocumento')).toBeNull();
    });

    it('exige un código de reserva válido', () => {
      for (const valor of ['', 'abc', '0', '-3', '1.5']) {
        component.reservaIdConsulta = valor;
        component.contactoConsulta = '3001234567';
        component.consultarComoInvitado();
      }
      expect(toastr.warning).toHaveBeenCalledTimes(5);
      expect(toastr.warning).toHaveBeenCalledWith('Ingresa el código de tu reserva', 'Atención');
      expect(reservaService.consultarReserva).not.toHaveBeenCalled();
    });

    it('exige teléfono o documento', () => {
      component.reservaIdConsulta = '12';
      component.contactoConsulta = '   ';
      component.consultarComoInvitado();
      expect(toastr.warning).toHaveBeenCalledWith(
        'Ingresa el teléfono o documento con el que reservaste',
        'Atención',
      );
      expect(reservaService.consultarReserva).not.toHaveBeenCalled();
    });

    it('consulta con id y contacto y muestra solo los datos mínimos', () => {
      reservaService.consultarReserva.mockReturnValue(of(mockReservaConsulta));
      component.reservaIdConsulta = ' 1 ';
      component.contactoConsulta = ' 3216549870 ';

      component.consultarComoInvitado();
      fixture.detectChanges();

      expect(reservaService.consultarReserva).toHaveBeenCalledWith(1, '3216549870');
      expect(component.reservaConsultada).toBe(mockReservaConsulta);
      expect(component.consultaSinResultado).toBe(false);
      const html: string = fixture.nativeElement.textContent;
      expect(html).toContain('Reserva #1');
      expect(html).toContain('Restaurante');
      expect(html).not.toContain('Carlos Perez');
      expect(html).not.toContain('3216549870');
    });

    it('un contacto numérico (pegado como número) también se envía como texto', () => {
      reservaService.consultarReserva.mockReturnValue(of(mockReservaConsulta));
      component.reservaIdConsulta = '1';
      component.contactoConsulta = 1000000542 as unknown as string;
      component.consultarComoInvitado();
      expect(reservaService.consultarReserva).toHaveBeenCalledWith(1, '1000000542');
    });

    it('un contacto nulo se trata como vacío', () => {
      component.reservaIdConsulta = '1';
      component.contactoConsulta = null as unknown as string;
      component.consultarComoInvitado();
      expect(toastr.warning).toHaveBeenCalledWith(
        'Ingresa el teléfono o documento con el que reservaste',
        'Atención',
      );
    });

    it('muestra un mensaje genérico si no hay coincidencia y limpia el resultado previo', () => {
      component.reservaConsultada = mockReservaConsulta;
      reservaService.consultarReserva.mockReturnValue(of(null));
      component.reservaIdConsulta = '99';
      component.contactoConsulta = '300';

      component.consultarComoInvitado();
      fixture.detectChanges();

      expect(component.reservaConsultada).toBeNull();
      expect(component.consultaSinResultado).toBe(true);
      expect(fixture.nativeElement.textContent).toContain('No encontramos una reserva');
    });

    it('avisa del límite de consultas (429) y de otros errores', () => {
      component.reservaIdConsulta = '1';
      component.contactoConsulta = '300';

      reservaService.consultarReserva.mockReturnValue(throwError(() => ({ code: 429 })));
      component.consultarComoInvitado();
      expect(toastr.error).toHaveBeenCalledWith(
        'Demasiadas consultas, intenta de nuevo en un minuto',
        'Error',
      );

      reservaService.consultarReserva.mockReturnValue(throwError(() => ({ code: 500 })));
      component.consultarComoInvitado();
      expect(toastr.error).toHaveBeenCalledWith(
        'Ocurrió un error al consultar la reserva',
        'Error',
      );

      reservaService.consultarReserva.mockReturnValue(throwError(() => null));
      component.consultarComoInvitado();
      expect(toastr.error).toHaveBeenLastCalledWith(
        'Ocurrió un error al consultar la reserva',
        'Error',
      );
    });

    it('un invitado no puede cambiar el estado', () => {
      component.confirmarReserva(mockReserva);
      expect(reservaService.actualizarReserva).not.toHaveBeenCalled();
    });

    it('el envío del formulario dispara la consulta', () => {
      reservaService.consultarReserva.mockReturnValue(of(null));
      component.reservaIdConsulta = '5';
      component.contactoConsulta = '300';
      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
      expect(reservaService.consultarReserva).toHaveBeenCalledWith(5, '300');
    });
  });

  it('ordena por hora descendente cuando la fecha coincide', async () => {
    await crear('Administrador', 1);
    reservaService.getReservaByParameter.mockReturnValue(
      of(
        respuesta([
          { ...mockReserva, reservaId: 1, horaReserva: '12:00:00' },
          { ...mockReserva, reservaId: 2, horaReserva: '20:00:00' },
        ]),
      ),
    );
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-01';
    component.buscarReserva();
    expect(component.reservas.map((r) => r.reservaId)).toEqual([2, 1]);
  });
});
