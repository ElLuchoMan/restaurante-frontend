import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { TelemetryService } from '../services/telemetry.service';

export function telemetryInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const telemetry = inject(TelemetryService);
  const start = performance.now();

  return next(req).pipe(
    tap({
      next: (event) => {
        // Sólo medimos al completar mediante HttpResponse en un interceptor más elaborado.
        // Aquí registramos cada paso ok con status 200 si aplica vía finalize en un interceptor extendido.
      },
      error: (err: any) => {
        const durationMs = Math.round(performance.now() - start);
        const status = err?.status ?? 0;
        telemetry.logHttp({ method: req.method, url: req.url, ok: false, status, durationMs });
      },
      complete: () => {
        const durationMs = Math.round(performance.now() - start);
        // No tenemos fácil el status al completar sin HttpResponse, asumimos ok= true, status 200.
        telemetry.logHttp({ method: req.method, url: req.url, ok: true, status: 200, durationMs });
      },
    }),
  );
}
