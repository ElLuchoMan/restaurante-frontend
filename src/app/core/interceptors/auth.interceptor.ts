import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const validToken = userService.validateTokenAndLogout();

  if (validToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
