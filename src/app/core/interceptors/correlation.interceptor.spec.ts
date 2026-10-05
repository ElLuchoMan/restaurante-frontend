import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { EMPTY } from 'rxjs';

import { correlationInterceptor } from './correlation.interceptor';

describe('correlationInterceptor', () => {
  it('agrega el header x-correlation-id y expone correlationId en la petición', (done) => {
    const req = new HttpRequest('GET', '/restaurante/v1/test');

    const handler: HttpHandlerFn = (r) => {
      expect(r.headers.has('x-correlation-id')).toBe(true);
      // @ts-expect-error propiedad interna para encadenar en otros interceptores
      expect((r as any).correlationId).toBeDefined();
      done();
      // Devuelve un observable vacío
      return new (require('rxjs').Observable)((s: any) => s.complete());
    };

    correlationInterceptor(req, handler);
  });

  it('usa un id de respaldo cuando crypto.randomUUID no está disponible', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      const req = new HttpRequest('GET', '/restaurante/v1/test');
      let seen: HttpRequest<unknown> | undefined;
      const handler: HttpHandlerFn = (r) => {
        seen = r;
        return EMPTY;
      };
      correlationInterceptor(req, handler);
      const id = seen?.headers.get('x-correlation-id');
      expect(id).toMatch(/^[a-z0-9]+$/);
      expect((seen as unknown as { correlationId?: string }).correlationId).toBe(id);
    } finally {
      if (original) Object.defineProperty(globalThis, 'crypto', original);
    }
  });
});
