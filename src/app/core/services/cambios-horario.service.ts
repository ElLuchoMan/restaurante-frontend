import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';
import { HandleErrorService } from './handle-error.service';

export type CambiosHorarioCreate = Omit<CambioHorario, 'cambioHorarioId'>;
export type CambiosHorarioUpdate = Partial<CambiosHorarioCreate>;

@Injectable({ providedIn: 'root' })
export class CambiosHorarioService {
  private baseUrl = `${environment.apiUrl}/cambios_horario`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  private mapCreateToSwagger(body: CambiosHorarioCreate) {
    const mapped: Record<string, unknown> = {};
    if (body.fecha) mapped['fechaCambioHorario'] = body.fecha;
    if (body.horaApertura != null) mapped['horaApertura'] = body.horaApertura;
    if (body.horaCierre != null) mapped['horaCierre'] = body.horaCierre;
    if ((body as any).abierto !== undefined) mapped['abierto'] = (body as any).abierto;
    return mapped;
  }

  private mapUpdateToSwagger(body: CambiosHorarioUpdate) {
    const mapped: Record<string, unknown> = {};
    if (body.fecha) mapped['fechaCambioHorario'] = body.fecha;
    if (body.horaApertura != null) mapped['horaApertura'] = body.horaApertura;
    if (body.horaCierre != null) mapped['horaCierre'] = body.horaCierre;
    if ((body as any).abierto !== undefined) mapped['abierto'] = (body as any).abierto;
    return mapped;
  }

  list(): Observable<ApiResponse<Record<string, unknown>[]>> {
    return this.http
      .get<ApiResponse<Record<string, unknown>[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  getActual(): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http
      .get<ApiResponse<Record<string, unknown>>>(`${this.baseUrl}/actual`)
      .pipe(catchError(this.handleError.handleError));
  }

  create(body: CambiosHorarioCreate): Observable<ApiResponse<Record<string, unknown>>> {
    const payload = this.mapCreateToSwagger(body);
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(this.baseUrl, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  update(id: number, body: CambiosHorarioUpdate): Observable<ApiResponse<Record<string, unknown>>> {
    const params = new HttpParams().set('id', String(id));
    const payload = this.mapUpdateToSwagger(body);
    return this.http
      .put<ApiResponse<Record<string, unknown>>>(this.baseUrl, payload, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  delete(id: number): Observable<ApiResponse<Record<string, unknown>>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<Record<string, unknown>>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
