import { HttpErrorResponse } from '@angular/common/http';

export const mockHttpError500 = new HttpErrorResponse({
  status: 500,
  error: {
    message: 'Internal Server Error',
    cause: 'Database connection failed',
  },
});

export const mockHttpError400 = new HttpErrorResponse({
  status: 400,
  error: {},
});
