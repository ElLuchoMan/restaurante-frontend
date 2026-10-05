import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DiaSemana } from '../../shared/constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  HorarioTrabajador,
  HorarioTrabajadorCreate,
  HorarioTrabajadorUpdate,
} from '../../shared/models/horario-trabajador.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class HorarioTrabajadorService {
  private baseUrl = `${environment.apiUrl}/horario_trabajador`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /** GET /horario_trabajador (el back ignora en silencio un `dia` inválido). */
  list(params?: { documento?: number; dia?: DiaSemana }): Observable<HorarioTrabajador[]> {
    let httpParams: HttpParams | undefined;
    if (params) {
      let p = new HttpParams();
      if (params.documento !== undefined) p = p.set('documento', String(params.documento));
      if (params.dia) p = p.set('dia', params.dia);
      httpParams = p;
    }
    return this.http
      .get<ApiResponse<HorarioTrabajador[] | null>>(this.baseUrl, { params: httpParams })
      .pipe(
        map((res) => res.data ?? []),
        catchError(this.handleError.handleError),
      );
  }

  /**
   * PUT /horario_trabajador?documento=&dia= con merge. Errores: 400 (horaFin <= horaInicio,
   * formato), 404 (no existe). Responde el horario actualizado con su documentoTrabajador real.
   */
  update(
    documento: number,
    dia: DiaSemana,
    body: HorarioTrabajadorUpdate,
  ): Observable<ApiResponse<HorarioTrabajador>> {
    const params = new HttpParams().set('documento', String(documento)).set('dia', dia);
    return this.http
      .put<ApiResponse<HorarioTrabajador>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** POST /horario_trabajador. Errores: 400 (día/horas inválidas), 409 (ya hay horario ese día). */
  create(body: HorarioTrabajadorCreate): Observable<ApiResponse<HorarioTrabajador>> {
    return this.http
      .post<ApiResponse<HorarioTrabajador>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un horario por documento y día (404 si no existe).
   * DELETE /horario_trabajador?documento=...&dia=...
   */
  deleteByDocumentoDia(documento: number, dia: DiaSemana): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('documento', String(documento)).set('dia', dia);
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
