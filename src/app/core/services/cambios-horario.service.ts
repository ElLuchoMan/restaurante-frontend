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
import { notFoundAsEmpty } from './not-found.operator';

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

  /**
   * GET /cambios_horario/actual (público). Sin cambio hoy el back responde 404 HTTP; aquí se
   * expone como `{ code: 404, data: undefined }` (es "sin cambio", no un error).
   */
  getActual(): Observable<ApiResponse<CambioHorario | undefined>> {
    return this.http
      .get<ApiResponse<CambioHorario>>(`${this.baseUrl}/actual`)
      .pipe(
        notFoundAsEmpty<CambioHorario>('No hay cambios de horario para la fecha actual'),
        catchError(this.handleError.handleError),
      );
  }

  /** POST /cambios_horario. Errores: 400 (fecha/horas), 409 (ya hay un cambio para esa fecha). */
  create(body: CambiosHorarioCreate): Observable<ApiResponse<CambioHorario>> {
    return this.http
      .post<ApiResponse<CambioHorario>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /cambios_horario?id= con merge. Errores: 400, 404 (no existe), 409 (fecha repetida). */
  update(id: number, body: CambiosHorarioUpdate): Observable<ApiResponse<CambioHorario>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<CambioHorario>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** DELETE /cambios_horario?id=. Errores: 404 (no existe), 409 (en uso por un restaurante). */
  delete(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
