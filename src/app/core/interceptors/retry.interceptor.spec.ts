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

  it('reintenta GET con error de red (status 0)', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        subscriber.error(new HttpErrorResponse({ status: 0 }));
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    expect(calls).toBe(4); // inicial + 3 reintentos
  });

  it('reintenta GET con status 408 (Request Timeout)', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        subscriber.error(new HttpErrorResponse({ status: 408 }));
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    expect(calls).toBe(4);
  });

  it('reintenta GET con status 429 (Too Many Requests)', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        subscriber.error(new HttpErrorResponse({ status: 429 }));
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    expect(calls).toBe(4);
  });

  it('respeta el header Retry-After cuando es un número válido', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        const error = new HttpErrorResponse({
          status: 503,
          headers: new (class {
            get(name: string): string | null {
              return name === 'Retry-After' ? '2' : null;
            }
          })(),
        });
        subscriber.error(error);
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    // El delay debería ser 2000ms (2 segundos * 1000), pero con max de 5000ms
    jest.advanceTimersByTime(2000);

    expect(calls).toBeGreaterThan(1); // Al menos un reintento
  });

  it('usa exponential backoff cuando Retry-After no es un número', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        const error = new HttpErrorResponse({
          status: 503,
          headers: new (class {
            get(name: string): string | null {
              return name === 'Retry-After' ? 'invalid' : null;
            }
          })(),
        });
        subscriber.error(error);
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    // Debería usar exponential backoff: 200, 400, 800
    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    expect(calls).toBe(4); // inicial + 3 reintentos
  });

  it('reintenta HEAD con error 5xx', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        subscriber.error(new HttpErrorResponse({ status: 503 }));
      });

    const req = new HttpRequest('HEAD', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    expect(calls).toBe(4); // inicial + 3 reintentos
  });

  it('no reintenta cuando el status es 4xx (excepto 408 y 429)', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        subscriber.error(new HttpErrorResponse({ status: 404 }));
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    expect(calls).toBe(1); // No reintenta
    expect(captured).toBeInstanceOf(HttpErrorResponse);
  });

  it('maneja error sin status definido (undefined)', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        // Error sin status definido
        const error = new HttpErrorResponse({ status: undefined as any });
        subscriber.error(error);
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    // Debería tratarlo como status 0 (error de red) y reintentar
    expect(calls).toBe(4);
  });

  it('maneja error con status null', () => {
    let calls = 0;
    const handler: HttpHandlerFn = () =>
      new Observable((subscriber) => {
        calls += 1;
        // Error con status null
        const error = new HttpErrorResponse({ status: null as any });
        subscriber.error(error);
      });

    const req = new HttpRequest('GET', '/restaurante/v1/test');

    let captured: HttpErrorResponse | undefined;
    retryInterceptor(req, handler).subscribe({ error: (e) => (captured = e as HttpErrorResponse) });

    jest.advanceTimersByTime(1500);

    expect(captured).toBeInstanceOf(HttpErrorResponse);
    // Debería tratarlo como status 0 (error de red) y reintentar
    expect(calls).toBe(4);
  });
});
