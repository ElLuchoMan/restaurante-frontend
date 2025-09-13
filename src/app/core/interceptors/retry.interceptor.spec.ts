import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('reintenta GET fallido hasta 3 veces y luego propaga el error', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1; // se incrementa en cada re-suscripción (reintento)
        subscriber.error(new HttpErrorResponse({ status: 500 }));
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    // Avanzar backoff total 200 + 400 + 800
    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    expect(calls).toBe(4); // inicial + 3 reintentos
  });

  it('no reintenta cuando el método no es idempotente (POST)', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        subscriber.error(new HttpErrorResponse({ status: 500 }));
      });

    const req = new HttpRequest('POST', '/restaurante/v1/test');

    let captured: unknown;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e) });

    expect(calls).toBe(1);
    expect(captured).toBeInstanceOf(HttpErrorResponse);
  });
});
