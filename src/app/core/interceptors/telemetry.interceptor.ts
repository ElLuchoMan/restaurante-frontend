import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { TelemetryService } from '../services/telemetry.service';

export function telemetryInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const telemetry = inject(TelemetryService);
  const start = performance.now();
  const corrId = (req as any).correlationId as string | undefined;

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const durationMs = Math.round(performance.now() - start);
          (globalThis as any).__lastCorrelationId = corrId;
          telemetry.logHttp({
            method: req.method,
            url: req.url,
            ok: true,
            status: event.status,
            durationMs,
            requestId: corrId,
          });
        }
      },
      error: (err: any) => {
        const durationMs = Math.round(performance.now() - start);
        const status = err?.status ?? 0;
        telemetry.logHttp({
          method: req.method,
          url: req.url,
          ok: false,
          status,
          durationMs,
          requestId: corrId,
        });
      },
      complete: () => {},
    }),
  );
}
