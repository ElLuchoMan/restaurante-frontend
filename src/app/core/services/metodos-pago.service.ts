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

  /**
   * Crea un método de pago
   */
  create(body: MetodosPago): Observable<ApiResponse<MetodosPago>> {
    return this.http
      .post<ApiResponse<MetodosPago>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualiza un método de pago por ID
   */
  update(id: number, body: Partial<MetodosPago>): Observable<ApiResponse<MetodosPago>> {
    return this.http
      .put<ApiResponse<MetodosPago>>(`${this.baseUrl}?id=${id}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un método de pago por ID
   */
  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
