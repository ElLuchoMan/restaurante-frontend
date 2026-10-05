import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  CambioHorario,
  CambioHorarioCreate,
  CambioHorarioUpdate,
} from '../../shared/models/cambio-horario.model';
import { HandleErrorService } from './handle-error.service';

export type CambiosHorarioCreate = CambioHorarioCreate;
export type CambiosHorarioUpdate = CambioHorarioUpdate;

@Injectable({ providedIn: 'root' })
export class CambiosHorarioService {
  private baseUrl = `${environment.apiUrl}/cambios_horario`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(): Observable<ApiResponse<CambioHorario[]>> {
    return this.http
      .get<ApiResponse<CambioHorario[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /cambios_horario/actual (público). Sin cambio hoy: HTTP 200, code 404 y sin `data`. */
  getActual(): Observable<ApiResponse<CambioHorario | undefined>> {
    return this.http
      .get<ApiResponse<CambioHorario | undefined>>(`${this.baseUrl}/actual`)
      .pipe(catchError(this.handleError.handleError));
  }

  create(body: CambiosHorarioCreate): Observable<ApiResponse<CambioHorario>> {
    return this.http
      .post<ApiResponse<CambioHorario>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  update(
    id: number,
    body: CambiosHorarioUpdate,
  ): Observable<ApiResponse<CambioHorario | undefined>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<CambioHorario | undefined>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
