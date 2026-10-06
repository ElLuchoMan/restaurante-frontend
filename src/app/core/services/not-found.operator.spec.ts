import { HttpErrorResponse } from '@angular/common/http';
import { expect } from '@jest/globals';
import { firstValueFrom, of, throwError } from 'rxjs';

import { ApiResponse } from '../../shared/models/api-response.model';
import { notFoundAsEmpty } from './not-found.operator';

describe('notFoundAsEmpty', () => {
  const ok: ApiResponse<{ id: number }> = { code: 200, message: 'OK', data: { id: 1 } };

  it('deja pasar las respuestas correctas', async () => {
    await expect(firstValueFrom(of(ok).pipe(notFoundAsEmpty('x')))).resolves.toEqual(ok);
  });

  it('convierte un 404 HTTP en una respuesta sin data usando el mensaje del back', async () => {
    const err = new HttpErrorResponse({
      status: 404,
      error: { code: 404, message: 'No existe', cause: 'sin filas' },
    });
    await expect(
      firstValueFrom(throwError(() => err).pipe(notFoundAsEmpty<{ id: number }>('fallback'))),
    ).resolves.toEqual({ code: 404, message: 'No existe', cause: 'sin filas', data: undefined });
  });

  it('usa el mensaje por defecto cuando el 404 no trae cuerpo', async () => {
    const err = new HttpErrorResponse({ status: 404 });
    const res = await firstValueFrom(
      throwError(() => err).pipe(notFoundAsEmpty<{ id: number }>('fallback')),
    );
    expect(res.message).toBe('fallback');
    expect(res.data).toBeUndefined();
  });

  it('propaga cualquier otro error HTTP', async () => {
    const err = new HttpErrorResponse({ status: 500 });
    await expect(firstValueFrom(throwError(() => err).pipe(notFoundAsEmpty('x')))).rejects.toBe(
      err,
    );
  });

  it('propaga errores que no son HttpErrorResponse', async () => {
    const err = new Error('boom');
    await expect(firstValueFrom(throwError(() => err).pipe(notFoundAsEmpty('x')))).rejects.toBe(
      err,
    );
  });
});
