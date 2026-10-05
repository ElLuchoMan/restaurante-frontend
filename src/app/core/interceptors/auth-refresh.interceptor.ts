import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { UserService } from '../services/user.service';

// Estado global para el interceptor
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
  null,
);

// Función para resetear el estado (solo para testing)
export function resetAuthRefreshState(): void {
  isRefreshing = false;
  refreshTokenSubject.next(null);
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo manejar errores 401 en endpoints que no sean login o refresh
      if (
        error.status === 401 &&
        !req.url.includes('/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        return handle401Error(req, next, userService, router);
      }

      return throwError(() => error) as unknown as import('rxjs').Observable<HttpEvent<unknown>>;
    }),
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  userService: UserService,
  router: Router,
): import('rxjs').Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return userService.attemptTokenRefresh().pipe(
      switchMap((success: boolean) => {
        isRefreshing = false;

        if (success) {
          refreshTokenSubject.next(userService.getToken());
          // Reintentar la request original con el nuevo token
          const newToken = userService.getToken();
          if (newToken) {
            const authReq = request.clone({
              headers: request.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(authReq);
          }
        }

        // Si el refresh falló, redirigir a login
        router.navigate(['/login']);
        return throwError(
          () => new Error('Token refresh failed'),
        ) as unknown as import('rxjs').Observable<HttpEvent<unknown>>;
      }),
      catchError((error) => {
        isRefreshing = false;
        router.navigate(['/login']);
        return throwError(() => error) as unknown as import('rxjs').Observable<HttpEvent<unknown>>;
      }),
    );
  } else {
    // Si ya se está refrescando, esperar a que termine
    return refreshTokenSubject.pipe(
      filter((token): token is string => token != null),
      take(1),
      switchMap(() => {
        const newToken = userService.getToken();
        if (newToken) {
          const authReq = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${newToken}`),
          });
          return next(authReq);
        }
        return throwError(
          () => new Error('No token available'),
        ) as unknown as import('rxjs').Observable<HttpEvent<unknown>>;
      }),
    );
  }
}
