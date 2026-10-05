/** @jest-environment node */
import { createFnMock } from '../../shared/mocks/test-doubles';
import { NativePushService } from './native-push.service';

const addListenerMock = createFnMock();
const pushMock = {
  requestPermissions: createFnMock(async () => ({ receive: 'granted' })),
  register: createFnMock(async () => undefined),
  createChannel: createFnMock(async () => undefined),
  addListener: addListenerMock,
};
const firebaseMock = {
  requestPermissions: createFnMock(async () => ({})),
  getToken: createFnMock(async () => ({ token: undefined })),
  addListener: createFnMock(),
};

jest.mock('@capacitor/push-notifications', () => ({ PushNotifications: pushMock }));
jest.mock('@capacitor-firebase/messaging', () => ({ FirebaseMessaging: firebaseMock }));

describe('NativePushService (SSR, sin window)', () => {
  const g = globalThis as any;

  afterEach(() => {
    delete g.window;
    jest.restoreAllMocks();
  });

  function createService(): NativePushService {
    const push: any = { sendToken: createFnMock(), registerToken: createFnMock() };
    const user: any = { getUserId: createFnMock(() => 1), getAuthState: createFnMock() };
    return new NativePushService(push, user);
  }

  it('init no hace nada cuando window no existe', async () => {
    const service = createService();
    expect(typeof window).toBe('undefined');
    await service.init();
    expect(pushMock.requestPermissions).not.toHaveBeenCalled();
  });

  it('no emite el evento de navegación al tocar la notificación si window desapareció', async () => {
    g.window = { Capacitor: { getPlatform: () => 'android' } };
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const dispatch = createFnMock();
    g.window.dispatchEvent = dispatch;
    const service = createService();

    await service.init();

    const call = addListenerMock.mock.calls.find((c) => c[0] === 'pushNotificationActionPerformed');
    expect(call).toBeDefined();

    delete g.window;
    await call![1]({ notification: { data: { url: '/pedidos' } } });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
