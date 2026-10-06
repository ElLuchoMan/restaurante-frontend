import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const validToken = userService.validateTokenAndLogout();

  // Solo adjuntar Authorization a llamadas del API, no a assets/HTML/etc.
  const url = (req as unknown as { url?: unknown }).url as string | undefined;
  const isApiRequest = typeof url === 'string' && url.indexOf('/restaurante/v1') !== -1;

  // Respetar un Authorization explícito (p. ej. POST /auth/refresh envía el refresh token)
  if (validToken && isApiRequest && !req.headers.has('Authorization')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
