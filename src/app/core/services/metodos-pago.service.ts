import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { MetodosPago } from '../../shared/models/metodo-pago.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class MetodosPagoService {
  private baseUrl = `${environment.apiUrl}/metodos_pago`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * Obtiene todos los métodos de pago
   */
  getAll(): Observable<ApiResponse<MetodosPago[]>> {
    return this.http
      .get<ApiResponse<MetodosPago[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * (Opcional) Obtener un método de pago por ID
   */
  getById(id: number): Observable<ApiResponse<MetodosPago>> {
    return this.http
      .get<ApiResponse<MetodosPago>>(`${this.baseUrl}/search`, {
        params: { id: id.toString() },
      })
      .pipe(catchError(this.handleError.handleError));
  }
}
