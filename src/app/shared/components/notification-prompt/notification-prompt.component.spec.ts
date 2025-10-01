import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebPushService } from '../../../core/services/web-push.service';
import { createWebPushServiceMock } from '../../mocks/test-doubles';
import { NotificationPromptComponent } from './notification-prompt.component';

describe('NotificationPromptComponent', () => {
  let component: NotificationPromptComponent;
  let fixture: ComponentFixture<NotificationPromptComponent>;
  let webPushService: jest.Mocked<WebPushService>;

  beforeEach(async () => {
    const webPushMock = createWebPushServiceMock();
    (webPushMock.isSupported as jest.Mock).mockReturnValue(true);
    (webPushMock.getPermissionStatus as jest.Mock).mockReturnValue('default');

    await TestBed.configureTestingModule({
      imports: [NotificationPromptComponent],
      providers: [{ provide: WebPushService, useValue: webPushMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPromptComponent);
    component = fixture.componentInstance;
    webPushService = TestBed.inject(WebPushService) as jest.Mocked<WebPushService>;

    jest.clearAllMocks();
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
});
