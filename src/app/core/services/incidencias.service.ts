import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Incidencia,
  IncidenciaCreate,
  IncidenciaUpdate,
} from '../../shared/models/incidencia.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private baseUrl = `${environment.apiUrl}/incidencias`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(): Observable<ApiResponse<Incidencia[]>> {
    return this.http
      .get<ApiResponse<Incidencia[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  create(body: IncidenciaCreate): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  update(id: number, body: IncidenciaUpdate): Observable<ApiResponse<Record<string, unknown>>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Record<string, unknown>>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  delete(id: number): Observable<ApiResponse<Record<string, unknown>>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<Record<string, unknown>>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Busca incidencias por documento y periodo (mes y año)
   * GET /incidencias/search?documento=...&mes=...&anio=...
   */
  search(params: {
    documento: number;
    mes: number;
    anio: number;
  }): Observable<ApiResponse<Incidencia[]>> {
    let hp = new HttpParams();
    hp = hp.set('documento', String(params.documento));
    hp = hp.set('mes', String(params.mes));
    hp = hp.set('anio', String(params.anio));
    return this.http
      .get<ApiResponse<Incidencia[]>>(`${this.baseUrl}/search`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }
}
