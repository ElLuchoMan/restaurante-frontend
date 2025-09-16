import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';

export interface CambiosHorario {
  cambiosHorarioId?: number;
  fecha: string;
  horaApertura?: string;
  horaCierre?: string;
  observaciones?: string;
}

export type CambiosHorarioCreate = Omit<CambiosHorario, 'cambiosHorarioId'>;
export type CambiosHorarioUpdate = Partial<CambiosHorarioCreate>;

@Injectable({ providedIn: 'root' })
export class CambiosHorarioService {
  private baseUrl = `${environment.apiUrl}/cambios_horario`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

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
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  update(id: number, body: CambiosHorarioUpdate): Observable<ApiResponse<Record<string, unknown>>> {
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
}
