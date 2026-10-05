import { HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, OperatorFunction, throwError } from 'rxjs';

import { ApiResponse } from '../../shared/models/api-response.model';

/**
 * El back responde 404 con status HTTP real cuando un recurso no existe. Para las consultas
 * donde "no encontrado" es un resultado esperado (no un fallo) este operador convierte ese 404
 * en una respuesta `{ code: 404, message, data: undefined }`; cualquier otro error se
 * propaga intacto (para que lo trate `HandleErrorService`).
 */
export function notFoundAsEmpty<T>(
  fallbackMessage: string,
): OperatorFunction<ApiResponse<T>, ApiResponse<T | undefined>> {
  return catchError((err: unknown): Observable<ApiResponse<T | undefined>> => {
    if (err instanceof HttpErrorResponse && err.status === 404) {
      const body = (err.error ?? {}) as Partial<ApiResponse<unknown>>;
      return of({
        code: 404,
        message: body.message || fallbackMessage,
        cause: body.cause,
        data: undefined,
      });
    }
    return throwError(() => err);
  });
}
