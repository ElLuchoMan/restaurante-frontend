import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Pago, PagoCreate, PagoListParams, PagoUpdate } from '../../shared/models/pago.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/pagos` (requiere token). El back usa el status HTTP real (400 datos inválidos,
 * 404 inexistente) y un listado sin resultados responde 200 con `data: []`.
 */
@Injectable({ providedIn: 'root' })
export class PagoService {
  private baseUrl = `${environment.apiUrl}/pagos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  createPago(payload: PagoCreate): Observable<ApiResponse<Pago>> {
    return this.http
      .post<ApiResponse<Pago>>(this.baseUrl, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /pagos con filtros opcionales (se omiten los `undefined`/`null`). */
  getPagos(params?: PagoListParams): Observable<ApiResponse<Pago[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Pago[]>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  getPagoById(id: number): Observable<ApiResponse<Pago>> {
    return this.http
      .get<ApiResponse<Pago>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /pagos?id=: merge, el cuerpo puede ser parcial. Responde el pago actualizado. */
  updatePago(id: number, payload: PagoUpdate): Observable<ApiResponse<Pago>> {
    return this.http
      .put<ApiResponse<Pago>>(`${this.baseUrl}?id=${id}`, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  deletePago(id: number): Observable<ApiResponse<undefined>> {
    return this.http
      .delete<ApiResponse<undefined>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
