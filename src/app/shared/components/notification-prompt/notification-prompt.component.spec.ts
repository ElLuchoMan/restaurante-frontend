import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { WebPushService } from '../../../core/services/web-push.service';
import { createCapacitorMock, createWebPushServiceMock } from '../../mocks/test-doubles';
import { NotificationPromptComponent } from './notification-prompt.component';

describe('NotificationPromptComponent', () => {
  let component: NotificationPromptComponent;
  let fixture: ComponentFixture<NotificationPromptComponent>;
  let webPushService: jest.Mocked<WebPushService>;

  beforeEach(async () => {
    // Limpiar localStorage
    localStorage.clear();

    const webPushMock = createWebPushServiceMock();
    (webPushMock.isSupported as jest.Mock).mockReturnValue(true);
    (webPushMock.getPermissionStatus as jest.Mock).mockReturnValue('default');

    await TestBed.configureTestingModule({
      imports: [NotificationPromptComponent],
      providers: [
        { provide: WebPushService, useValue: webPushMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPromptComponent);
    component = fixture.componentInstance;
    webPushService = TestBed.inject(WebPushService) as jest.Mocked<WebPushService>;

    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('no debería mostrar el prompt inicialmente', () => {
    expect(component.showPrompt).toBe(false);
  });

  it('debería ocultar el prompt si el usuario lo cierra', () => {
    component.showPrompt = true;
    fixture.detectChanges();

    component.dismiss();

    expect(component.showPrompt).toBe(false);
    expect(localStorage.getItem('notification-prompt-dismissed')).toBe('true');

    // Limpiar localStorage
    localStorage.removeItem('notification-prompt-dismissed');
  });

  it('debería activar notificaciones cuando el usuario acepta', async () => {
    webPushService.requestPermissionAndSubscribe.mockResolvedValue(true);
    component.showPrompt = true;

    await component.enableNotifications();

    expect(webPushService.requestPermissionAndSubscribe).toHaveBeenCalled();
    expect(component.showPrompt).toBe(false);
  });

  it('debería manejar error cuando falla la activación', async () => {
    webPushService.requestPermissionAndSubscribe.mockRejectedValue(new Error('Permission denied'));
    component.showPrompt = true;

    await component.enableNotifications();

    expect(component.requesting).toBe(false);
  });

  it('debería ocultar el prompt si el permiso fue denegado', async () => {
    webPushService.requestPermissionAndSubscribe.mockResolvedValue(false);
    webPushService.getPermissionStatus.mockReturnValue('denied');
    component.showPrompt = true;

    await component.enableNotifications();

    expect(component.showPrompt).toBe(false);
    expect(localStorage.getItem('notification-prompt-dismissed')).toBe('true');
  });

  it('debería mantener el prompt visible si falló pero no fue denegado', async () => {
    webPushService.requestPermissionAndSubscribe.mockResolvedValue(false);
    webPushService.getPermissionStatus.mockReturnValue('default');
    component.showPrompt = true;

    await component.enableNotifications();

    expect(component.showPrompt).toBe(true);
    expect(component.requesting).toBe(false);
  });

  it('no debería mostrar el prompt si ya fue descartado', fakeAsync(() => {
    localStorage.setItem('notification-prompt-dismissed', 'true');

    component.ngOnInit();
    tick(3100);

    expect(component.showPrompt).toBe(false);
  }));

  it('no debería mostrar el prompt si ya tiene permisos granted', fakeAsync(() => {
    webPushService.getPermissionStatus.mockReturnValue('granted');

    component.ngOnInit();
    tick(3100);

    expect(component.showPrompt).toBe(false);
  }));

  it('no debería mostrar el prompt si el permiso es denied', fakeAsync(() => {
    webPushService.getPermissionStatus.mockReturnValue('denied');

    component.ngOnInit();
    tick(3100);

    expect(component.showPrompt).toBe(false);
  }));

  it('no debería mostrar el prompt si no está soportado', fakeAsync(() => {
    webPushService.isSupported.mockReturnValue(false);

    component.ngOnInit();
    tick(3100);

    expect(component.showPrompt).toBe(false);
  }));

  it('debería mostrar el prompt después de 3 segundos si no fue descartado', fakeAsync(() => {
    component.ngOnInit();

    expect(component.showPrompt).toBe(false);

    tick(3100);

    expect(component.showPrompt).toBe(true);
  }));

  it('no debería mostrar el prompt en servidor (SSR)', () => {
    // Recrear el componente con PLATFORM_ID = 'server'
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NotificationPromptComponent],
      providers: [
        { provide: WebPushService, useValue: webPushService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    const serverFixture = TestBed.createComponent(NotificationPromptComponent);
    const serverComponent = serverFixture.componentInstance;

    serverComponent.ngOnInit();

    expect(serverComponent.showPrompt).toBe(false);
  });

  it('no debería mostrar el prompt en WebView', () => {
    // Mock Capacitor para simular WebView
    (window as any).Capacitor = createCapacitorMock();

    component.ngOnInit();

    expect(component.showPrompt).toBe(false);

    // Limpiar mock
    delete (window as any).Capacitor;
  });

  it('debería poder destruirse sin errores', () => {
    // El componente no tiene lógica de limpieza específica
    // Verificamos que el componente existe y puede ser destruido por Angular
    expect(component).toBeTruthy();
    fixture.destroy();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
