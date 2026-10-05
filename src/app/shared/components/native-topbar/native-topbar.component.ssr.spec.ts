/** @jest-environment node */
import { BehaviorSubject, Subject } from 'rxjs';

import { createFnMock } from '../../mocks/test-doubles';
import { NativeTopbarComponent } from './native-topbar.component';

describe('NativeTopbarComponent (SSR parcial: document sin window)', () => {
  const g = globalThis as any;

  afterEach(() => {
    delete g.document;
  });

  it('no registra listeners de notificaciones si window no existe', () => {
    g.document = {
      getElementById: createFnMock(() => null),
      querySelector: createFnMock(() => null),
    };
    const cart: any = { count$: new BehaviorSubject(0) };
    const user: any = {
      getAuthState: createFnMock(() => new BehaviorSubject(false)),
      getUserRole: createFnMock(() => null),
    };
    const router: any = { events: new Subject(), url: '/' };
    const comp = new NativeTopbarComponent(cart, user, router, 'browser');

    expect(typeof window).toBe('undefined');
    comp.ngOnInit();

    expect((comp as any).removeNotificationListeners).toBeNull();
    expect(comp.topBarActions.length).toBeGreaterThan(0);
    comp.ngOnDestroy();
  });
});
