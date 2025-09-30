import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  EnviarNotificacionRequest,
  EnviarNotificacionResponse,
  PushDispositivo,
  PushParams,
  RegistrarDispositivoRequest,
} from '../../shared/models/push.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  private baseUrl = `${environment.apiUrl}/push`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  registrarDispositivo(
    body: RegistrarDispositivoRequest,
  ): Observable<ApiResponse<PushDispositivo>> {
    return this.http
      .post<ApiResponse<PushDispositivo>>(`${this.baseUrl}/dispositivos`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  listarDispositivos(params?: PushParams): Observable<ApiResponse<PushDispositivo[]>> {
    let hp = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) hp = hp.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<PushDispositivo[]>>(`${this.baseUrl}/dispositivos`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarUltimaVista(id: number): Observable<ApiResponse<unknown>> {
    return this.http
      .patch<ApiResponse<unknown>>(`${this.baseUrl}/dispositivos/${id}/visto`, null)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarEstado(id: number, enabled: boolean): Observable<ApiResponse<unknown>> {
    return this.http
      .patch<ApiResponse<unknown>>(`${this.baseUrl}/dispositivos/${id}/estado`, { enabled })
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarTopics(id: number, subscribedTopics: string[]): Observable<ApiResponse<unknown>> {
    return this.http
      .patch<ApiResponse<unknown>>(`${this.baseUrl}/dispositivos/${id}/topics`, {
        subscribedTopics,
      })
      .pipe(catchError(this.handleError.handleError));
  }

  enviarNotificacion(
    body: EnviarNotificacionRequest,
  ): Observable<ApiResponse<EnviarNotificacionResponse>> {
    console.log('[Push] Enviando notificación:', body);
    return this.http
      .post<ApiResponse<EnviarNotificacionResponse>>(`${this.baseUrl}/enviar`, body)
      .pipe(catchError(this.handleError.handleError));
  }
}
