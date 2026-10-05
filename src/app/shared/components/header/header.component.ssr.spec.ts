/** @jest-environment node */
import { BehaviorSubject } from 'rxjs';

import { createFnMock } from '../../mocks/test-doubles';
import { HeaderComponent } from './header.component';

describe('HeaderComponent (SSR parcial: window sin document)', () => {
  const g = globalThis as any;

  afterEach(() => {
    delete g.window;
  });

  it('no programa la limpieza del navbar si document no existe', () => {
    g.window = {};
    const timeout = jest.spyOn(globalThis, 'setTimeout');
    const user: any = {
      getAuthState: createFnMock(() => new BehaviorSubject(false)),
      getUserRole: createFnMock(() => null),
    };
    const cart: any = { count$: new BehaviorSubject(0) };
    const network: any = { isOnline$: new BehaviorSubject(true) };
    const live: any = { announce: createFnMock() };
    const layout: any = { headerVisible$: new BehaviorSubject(true) };
    const router: any = { events: new BehaviorSubject(null), url: '/' };
    const comp = new HeaderComponent(user, 'browser', router, cart, live, network, layout);
    jest.spyOn(comp as any, 'generateMenu').mockImplementation(() => {});
    jest.spyOn(comp as any, 'checkScreenSize').mockImplementation(() => {});
    jest.spyOn(comp as any, 'bindMenuA11yHandlers').mockImplementation(() => {});

    expect(typeof document).toBe('undefined');
    comp.ngOnInit();

    expect(comp.showHeader).toBe(true);
    expect(timeout).not.toHaveBeenCalled();
    comp.ngOnDestroy();
    timeout.mockRestore();
  });
});
