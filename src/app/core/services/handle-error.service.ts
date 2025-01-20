import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleErrorService {

  handleError(error: HttpErrorResponse): Observable<never> {
    const formattedError = {
      code: error.status,
      message: error.error?.message || 'Ocurrió un error inesperado',
      cause: error.error?.cause || 'No especificado',
    };
    return throwError(() => formattedError);
  }
}
