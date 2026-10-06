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

  create(body: IncidenciaCreate): Observable<ApiResponse<Incidencia>> {
    return this.http
      .post<ApiResponse<Incidencia>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /incidencias?id= con merge. Errores: 400 (validación), 404 (no existe). */
  update(id: number, body: IncidenciaUpdate): Observable<ApiResponse<Incidencia>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Incidencia>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** DELETE /incidencias?id= (404 si no existe). */
  delete(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Busca incidencias por documento y periodo (mes 1-12 y año <= año actual)
   * GET /incidencias/search?documento=...&mes=...&anio=...
   * Sin resultados: HTTP 200 con `data: []`.
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
