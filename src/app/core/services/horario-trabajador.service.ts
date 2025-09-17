import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  HorarioTrabajador,
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

  list(params?: { documento?: number; dia?: string }): Observable<HorarioTrabajador[]> {
    let httpParams: HttpParams | undefined;
    if (params) {
      let p = new HttpParams();
      if (params.documento !== undefined) p = p.set('documento', String(params.documento));
      if (params.dia) p = p.set('dia', params.dia);
      httpParams = p;
    }
    return this.http
      .get<ApiResponse<HorarioTrabajador[]>>(this.baseUrl, { params: httpParams })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError.handleError),
      );
  }

  update(
    documento: number,
    dia: string,
    body: HorarioTrabajadorUpdate,
  ): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('documento', String(documento)).set('dia', dia);
    return this.http
      .put<ApiResponse<unknown>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  create(body: HorarioTrabajador): Observable<ApiResponse<unknown>> {
    return this.http
      .post<ApiResponse<unknown>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
