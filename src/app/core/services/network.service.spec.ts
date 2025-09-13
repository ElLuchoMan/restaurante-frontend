import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

import { NetworkService } from './network.service';

describe('NetworkService', () => {
  it('emite el estado inicial en browser', (done) => {
    Object.defineProperty(global, 'navigator', { value: { onLine: true }, configurable: true });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    const svc = TestBed.inject(NetworkService);
    svc.isOnline$.pipe(take(1)).subscribe((v) => {
      expect(v).toBe(true);
      done();
    });
  });

  it('emite false al evento offline y true al evento online', (done) => {
    Object.defineProperty(global, 'navigator', { value: { onLine: true }, configurable: true });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    const svc = TestBed.inject(NetworkService);

    const values: boolean[] = [];
    const sub = svc.isOnline$.subscribe((v) => values.push(v));

    // Disparar eventos
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));

    // Espera microtask
    setTimeout(() => {
      sub.unsubscribe();
      expect(values).toContain(false);
      expect(values[values.length - 1]).toBe(true);
      done();
    }, 0);
  });
});
