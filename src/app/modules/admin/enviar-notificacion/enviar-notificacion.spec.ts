import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { PushService } from '../../../core/services/push.service';
import {
  createPushServiceMock,
  createRouterMock,
  createToastrMock,
} from '../../../shared/mocks/test-doubles';
import { EnviarNotificacionComponent } from './enviar-notificacion';

describe('EnviarNotificacionComponent', () => {
  let component: EnviarNotificacionComponent;
  let fixture: ComponentFixture<EnviarNotificacionComponent>;
  let pushService: jest.Mocked<PushService>;
  let toastr: jest.Mocked<ToastrService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const pushServiceMock = createPushServiceMock();
    const toastrMock = createToastrMock();
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [EnviarNotificacionComponent, FormsModule],
      providers: [
        { provide: PushService, useValue: pushServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnviarNotificacionComponent);
    component = fixture.componentInstance;
    pushService = TestBed.inject(PushService) as jest.Mocked<PushService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('enviarNotificacion', () => {
    it('debería enviar notificación a TODOS exitosamente', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 10,
          enviosExitosos: 10,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: { tipoDestinatario: 'TODOS' },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'TODOS';
      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'TODOS' },
        notificacion: {
          titulo: 'Test',
          mensaje: 'Mensaje test',
          datos: { url: '/home' },
        },
      });
      expect(toastr.success).toHaveBeenCalledWith('Notificación enviada exitosamente', 'Éxito');
    });

    it('debería enviar notificación a CLIENTES exitosamente', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 5,
          enviosExitosos: 5,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: {
            tipoDestinatario: 'CLIENTES',
            clientesNotificados: [1015466495],
          },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'CLIENTES';
      component.titulo = 'Promo para clientes';
      component.mensaje = 'Solo para clientes';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'CLIENTES' },
        notificacion: {
          titulo: 'Promo para clientes',
          mensaje: 'Solo para clientes',
          datos: { url: '/home' },
        },
      });
      expect(toastr.success).toHaveBeenCalled();
    });

    it('debería enviar notificación a TRABAJADORES exitosamente', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 3,
          enviosExitosos: 3,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: {
            tipoDestinatario: 'TRABAJADORES',
            trabajadoresNotificados: [1000000000],
          },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'TRABAJADORES';
      component.titulo = 'Comunicado interno';
      component.mensaje = 'Solo para trabajadores';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'TRABAJADORES' },
        notificacion: {
          titulo: 'Comunicado interno',
          mensaje: 'Solo para trabajadores',
          datos: { url: '/home' },
        },
      });
      expect(toastr.success).toHaveBeenCalled();
    });

    it('debería enviar notificación a CLIENTE específico', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 1,
          enviosExitosos: 1,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: { tipoDestinatario: 'CLIENTE' },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'CLIENTE';
      component.documentoCliente = 1015466495;
      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'CLIENTE', documentoCliente: 1015466495 },
        notificacion: {
          titulo: 'Test',
          mensaje: 'Mensaje test',
          datos: { url: '/home' },
        },
      });
    });

    it('debería enviar notificación a TOPIC', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 2,
          enviosExitosos: 2,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: { tipoDestinatario: 'TOPIC', topicsNotificados: ['promos'] },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'TOPIC';
      component.topic = 'promos';
      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'TOPIC', topic: 'promos' },
        notificacion: {
          titulo: 'Test',
          mensaje: 'Mensaje test',
          datos: { url: '/home' },
        },
      });
    });

    it('debería enviar notificación a TRABAJADOR específico', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 1,
          enviosExitosos: 1,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: { tipoDestinatario: 'TRABAJADOR' },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'TRABAJADOR';
      component.documentoTrabajadorDestinatario = 1000000001;
      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'TRABAJADOR', documentoTrabajador: 1000000001 },
        notificacion: {
          titulo: 'Test',
          mensaje: 'Mensaje test',
          datos: { url: '/home' },
        },
      });
    });

    it('debería enviar notificación con remitente SISTEMA', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 1,
          enviosExitosos: 1,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: { tipoDestinatario: 'TODOS' },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoRemitente = 'SISTEMA';
      component.tipoDestinatario = 'TODOS';
      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'SISTEMA' },
        destinatarios: { tipo: 'TODOS' },
        notificacion: {
          titulo: 'Test',
          mensaje: 'Mensaje test',
          datos: { url: '/home' },
        },
      });
    });

    it('debería enviar notificación con URL personalizada', () => {
      const mockResponse = {
        code: 200,
        message: 'Notificación enviada',
        data: {
          totalDispositivos: 1,
          enviosExitosos: 1,
          enviosFallidos: 0,
          detalleEnvios: [],
          resumenDestinatarios: { tipoDestinatario: 'TODOS' },
        },
      };
      pushService.enviarNotificacion.mockReturnValue(of(mockResponse));

      component.tipoDestinatario = 'TODOS';
      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';
      component.url = '/menu';

      component.enviarNotificacion();

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith({
        remitente: { tipo: 'TRABAJADOR', documentoTrabajador: 1015466494 },
        destinatarios: { tipo: 'TODOS' },
        notificacion: {
          titulo: 'Test',
          mensaje: 'Mensaje test',
          datos: { url: '/menu' },
        },
      });
    });

    it('debería manejar error al enviar notificación', () => {
      const mockError = { message: 'Error de conexión' };
      pushService.enviarNotificacion.mockReturnValue(throwError(() => mockError));

      component.titulo = 'Test';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(toastr.error).toHaveBeenCalledWith('Error de conexión', 'Error');
      expect(component.enviando).toBe(false);
    });

    it('no debería enviar si falta el título', () => {
      component.titulo = '';
      component.mensaje = 'Mensaje test';

      component.enviarNotificacion();

      expect(toastr.warning).toHaveBeenCalledWith('El título es obligatorio', 'Validación');
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('no debería enviar si falta el mensaje', () => {
      component.titulo = 'Test';
      component.mensaje = '';

      component.enviarNotificacion();

      expect(toastr.warning).toHaveBeenCalledWith('El mensaje es obligatorio', 'Validación');
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });
  });

  describe('cargarEjemplo', () => {
    it('debería cargar ejemplo de bienvenida', () => {
      component.cargarEjemplo('bienvenida');

      expect(component.titulo).toBe('¡Bienvenido a El Fogón de María! 👋');
      expect(component.mensaje).toContain('Gracias por registrarte');
      expect(component.url).toBe('/home');
      expect(component.tipoDestinatario).toBe('CLIENTE');
    });

    it('debería cargar ejemplo de promo', () => {
      component.cargarEjemplo('promo');

      expect(component.titulo).toBe('🎉 Promoción Especial');
      expect(component.mensaje).toContain('20% de descuento');
      expect(component.url).toBe('/menu');
      expect(component.tipoDestinatario).toBe('TODOS');
    });

    it('debería cargar ejemplo de promo-clientes', () => {
      component.cargarEjemplo('promo-clientes');

      expect(component.titulo).toBe('🎁 Promoción Exclusiva para Clientes');
      expect(component.mensaje).toContain('25% en tu próximo pedido');
      expect(component.url).toBe('/menu');
      expect(component.tipoDestinatario).toBe('CLIENTES');
    });

    it('debería cargar ejemplo de aviso-trabajadores', () => {
      component.cargarEjemplo('aviso-trabajadores');

      expect(component.titulo).toBe('📢 Comunicado Interno');
      expect(component.mensaje).toContain('Reunión de equipo');
      expect(component.url).toBe('/trabajadores/comunicados');
      expect(component.tipoDestinatario).toBe('TRABAJADORES');
    });

    it('debería cargar ejemplo de reserva', () => {
      component.cargarEjemplo('reserva');

      expect(component.titulo).toBe('Reserva Confirmada ✅');
      expect(component.mensaje).toContain('confirmada');
      expect(component.url).toBe('/reservas/consultar');
      expect(component.tipoDestinatario).toBe('CLIENTE');
    });

    it('debería cargar ejemplo de calificacion', () => {
      component.cargarEjemplo('calificacion');

      expect(component.titulo).toContain('Califícanos');
      expect(component.mensaje).toContain('experiencia');
      expect(component.url).toBe('/cliente/perfil');
      expect(component.tipoDestinatario).toBe('CLIENTE');
    });
  });

  describe('volver', () => {
    it('debería navegar a acciones', () => {
      component.volver();

      expect(router.navigate).toHaveBeenCalledWith(['/admin/acciones']);
    });
  });
});
