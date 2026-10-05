/** @jest-environment node */
import { HttpClient } from '@angular/common/http';

import {
  createHandleErrorServiceMock,
  createLoggingServiceMock,
} from '../../shared/mocks/test-doubles';
import { UserService } from './user.service';

describe('UserService (SSR, sin window)', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(
      {} as HttpClient,
      createHandleErrorServiceMock(),
      createLoggingServiceMock(),
    );
  });

  it('el entorno no tiene window', () => {
    expect(typeof window).toBe('undefined');
  });

  it('getToken y getRefreshToken devuelven null', () => {
    expect(service.getToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('saveToken no guarda ni emite estado autenticado', () => {
    const states: boolean[] = [];
    service.getAuthState().subscribe((v) => states.push(v));
    service.saveToken('abc');
    expect(states).toEqual([false]);
  });

  it('saveTokens no guarda, no emite ni programa refresh', () => {
    const states: boolean[] = [];
    service.getAuthState().subscribe((v) => states.push(v));
    const timeoutSpy = jest.spyOn(globalThis, 'setTimeout');
    service.saveTokens('a', 'r');
    expect(states).toEqual([false]);
    expect(timeoutSpy).not.toHaveBeenCalled();
    timeoutSpy.mockRestore();
  });

  it('logout emite false sin tocar storages', () => {
    const states: boolean[] = [];
    service.getAuthState().subscribe((v) => states.push(v));
    service.setRemember(false);
    expect(() => service.logout()).not.toThrow();
    expect(states).toEqual([false, false]);
  });
});
