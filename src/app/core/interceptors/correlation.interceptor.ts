import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

function generateId(): string {
  const rnd = Math.random().toString(36).slice(2);
  const ts = Date.now().toString(36);
  return globalThis.crypto?.randomUUID?.() ?? `${rnd}${ts}`;
}

export const correlationInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const id = generateId();
  return next(req.clone({ setHeaders: { 'x-correlation-id': id } }));
};
