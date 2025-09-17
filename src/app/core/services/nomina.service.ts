import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Nomina } from '../../shared/models/nomina.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class NominaService {
  private baseUrl = `${environment.apiUrl}/nominas`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(params?: { fecha?: string; mes?: number; anio?: number }): Observable<Nomina[]> {
    let hp: HttpParams | undefined;
    if (params) {
      let p = new HttpParams();
      if (params.fecha) p = p.set('fecha', params.fecha);
      if (params.mes !== undefined) p = p.set('mes', String(params.mes));
      if (params.anio !== undefined) p = p.set('anio', String(params.anio));
      hp = p;
    }
    return this.http.get<ApiResponse<Nomina[]>>(this.baseUrl, { params: hp }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  updateEstado(id: number): Observable<Nomina> {
    const params = new HttpParams().set('id', String(id));
    return this.http.put<ApiResponse<Nomina>>(this.baseUrl, {}, { params }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  create(body: Partial<Nomina>): Observable<ApiResponse<Nomina>> {
    return this.http
      .post<ApiResponse<Nomina>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
