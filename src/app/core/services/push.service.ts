import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  EnviarNotificacionRequest,
  EnviarNotificacionResponse,
  PushDispositivo,
  PushEnvio,
  PushEnviosParams,
  PushPaginatedData,
  PushParams,
  RegistrarDispositivoRequest,
  RegistrarEnvioRequest,
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

  listarDispositivos(
    params?: PushParams,
  ): Observable<ApiResponse<PushPaginatedData<PushDispositivo>>> {
    return this.http
      .get<ApiResponse<PushPaginatedData<PushDispositivo>>>(`${this.baseUrl}/dispositivos`, {
        params: this.toHttpParams(params),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  private toHttpParams(params?: object): HttpParams {
    let hp = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) hp = hp.set(k, String(v));
      });
    }
    return hp;
  }

  obtenerDispositivo(id: number): Observable<ApiResponse<PushDispositivo>> {
    return this.http
      .get<ApiResponse<PushDispositivo>>(`${this.baseUrl}/dispositivos/search`, {
        params: new HttpParams().set('id', String(id)),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  eliminarDispositivo(id: number): Observable<ApiResponse<null>> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}/dispositivos`, {
        params: new HttpParams().set('id', String(id)),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarUltimaVista(id: number): Observable<ApiResponse<null>> {
    return this.http
      .patch<ApiResponse<null>>(`${this.baseUrl}/dispositivos/visto`, null, {
        params: new HttpParams().set('id', String(id)),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /push/dispositivos?id=<id> con body { enabled }. */
  actualizarEstado(id: number, enabled: boolean): Observable<ApiResponse<null>> {
    return this.http
      .put<ApiResponse<null>>(
        `${this.baseUrl}/dispositivos`,
        { enabled },
        { params: new HttpParams().set('id', String(id)) },
      )
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarTopics(id: number, subscribedTopics: string[]): Observable<ApiResponse<null>> {
    return this.http
      .patch<ApiResponse<null>>(
        `${this.baseUrl}/dispositivos/topics`,
        { subscribedTopics },
        { params: new HttpParams().set('id', String(id)) },
      )
      .pipe(catchError(this.handleError.handleError));
  }

  listarEnvios(params?: PushEnviosParams): Observable<ApiResponse<PushPaginatedData<PushEnvio>>> {
    return this.http
      .get<ApiResponse<PushPaginatedData<PushEnvio>>>(`${this.baseUrl}/envios`, {
        params: this.toHttpParams(params),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  registrarEnvio(body: RegistrarEnvioRequest): Observable<ApiResponse<PushEnvio>> {
    return this.http
      .post<ApiResponse<PushEnvio>>(`${this.baseUrl}/envios`, body)
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
