import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const token = userService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: token,
      },
    });
    return next(authReq);
  }

  return next(req);
};
