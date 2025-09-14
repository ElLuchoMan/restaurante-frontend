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
  // Propagar el ID también a la respuesta via headers clonados no es posible desde aquí,
  // así que adjuntamos el ID en la petición para que otros interceptores/handlers puedan leerlo.
  const cloned = req.clone({ setHeaders: { 'x-correlation-id': id } });
  (cloned as unknown as { correlationId?: string }).correlationId = id;
  return next(cloned);
};
