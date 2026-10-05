import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Domicilio,
  DomicilioCreate,
  DomicilioDetalle,
  DomicilioListParams,
  DomicilioUpdate,
} from '../../shared/models/domicilio.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/domicilios` (requiere token). Cuando no hay resultados o el registro no existe,
 * el back responde HTTP 200 con `code: 404` y sin `data`.
 */
@Injectable({
  providedIn: 'root',
})
export class DomicilioService {
  private baseUrl = `${environment.apiUrl}/domicilios`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * GET /domicilios con filtros opcionales (se omiten los `undefined`/`null`).
   */
  getDomicilios(params?: DomicilioListParams): Observable<ApiResponse<Domicilio[] | undefined>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Domicilio[] | undefined>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /domicilios/search?id=. Incluye cliente y resumen del pedido si existen.
   * @param id ID del domicilio
   */
  getDomicilioById(id: number): Observable<ApiResponse<DomicilioDetalle | undefined>> {
    return this.http
      .get<ApiResponse<DomicilioDetalle | undefined>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Crea un nuevo domicilio.
   * @param domicilio Datos del domicilio a crear
   */
  createDomicilio(domicilio: DomicilioCreate): Observable<ApiResponse<Domicilio>> {
    return this.http
      .post<ApiResponse<Domicilio>>(this.baseUrl, domicilio)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualiza un domicilio existente. El back solo aplica `direccion`, `telefono` y `updatedBy`.
   * @param id ID del domicilio
   * @param domicilio Datos actualizados
   */
  updateDomicilio(
    id: number,
    domicilio: DomicilioUpdate,
  ): Observable<ApiResponse<Domicilio | undefined>> {
    return this.http
      .put<ApiResponse<Domicilio | undefined>>(`${this.baseUrl}?id=${id}`, domicilio)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un domicilio por ID.
   * @param id ID del domicilio
   */
  deleteDomicilio(id: number): Observable<ApiResponse<undefined>> {
    return this.http
      .delete<ApiResponse<undefined>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Asigna un domiciliario a un domicilio (lo pasa a EN_CAMINO). Responde 409 si ya estaba
   * asignado y 404 si no existe. `data` es un domicilio parcial (solo estado y trabajador).
   * @param domicilioId
   * @param trabajadorId
   */
  asignarDomiciliario(
    domicilioId: number,
    trabajadorId: number,
  ): Observable<ApiResponse<Domicilio>> {
    const params = new HttpParams()
      .set('domicilio_id', String(domicilioId))
      .set('trabajador_id', String(trabajadorId));

    return this.http
      .post<ApiResponse<Domicilio>>(`${this.baseUrl}/asignar`, {}, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
