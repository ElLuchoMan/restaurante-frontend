import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
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
});
