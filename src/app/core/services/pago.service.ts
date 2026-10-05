import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Pago, PagoCreate, PagoListParams, PagoUpdate } from '../../shared/models/pago.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/pagos` (requiere token). Cuando no hay resultados o el pago no existe, el back
 * responde HTTP 200 con `code: 404` y sin `data`.
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
  getPagos(params?: PagoListParams): Observable<ApiResponse<Pago[] | undefined>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Pago[] | undefined>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  getPagoById(id: number): Observable<ApiResponse<Pago | undefined>> {
    return this.http
      .get<ApiResponse<Pago | undefined>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  updatePago(id: number, payload: PagoUpdate): Observable<ApiResponse<Pago | undefined>> {
    return this.http
      .put<ApiResponse<Pago | undefined>>(`${this.baseUrl}?id=${id}`, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  deletePago(id: number): Observable<ApiResponse<undefined>> {
    return this.http
      .delete<ApiResponse<undefined>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
