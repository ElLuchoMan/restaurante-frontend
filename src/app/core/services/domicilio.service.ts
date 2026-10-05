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
 * Cliente de `/domicilios` (requiere token). El back usa el status HTTP real (400 filtros o body
 * inválidos, 404 inexistente, 409 conflicto) y un listado sin resultados responde 200 con
 * `data: []`.
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
   * GET /domicilios con filtros opcionales (se omiten los `undefined`/`null`). Un filtro con
   * formato inválido responde 400.
   */
  getDomicilios(params?: DomicilioListParams): Observable<ApiResponse<Domicilio[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Domicilio[]>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /domicilios/search?id=. Incluye cliente y resumen del pedido si existen; 404 si no existe.
   * @param id ID del domicilio
   */
  getDomicilioById(id: number): Observable<ApiResponse<DomicilioDetalle>> {
    return this.http
      .get<ApiResponse<DomicilioDetalle>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Crea un nuevo domicilio (responde 201; 400 si falta direccion/telefono, 404 si el
   * trabajador asignado no existe).
   * @param domicilio Datos del domicilio a crear
   */
  createDomicilio(domicilio: DomicilioCreate): Observable<ApiResponse<Domicilio>> {
    return this.http
      .post<ApiResponse<Domicilio>>(this.baseUrl, domicilio)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualiza un domicilio existente con merge (los campos ausentes se conservan). Con
   * `estado: ENTREGADO` lo marca como entregado; responde el domicilio completo actualizado.
   * @param id ID del domicilio
   * @param domicilio Campos a modificar
   */
  updateDomicilio(id: number, domicilio: DomicilioUpdate): Observable<ApiResponse<Domicilio>> {
    return this.http
      .put<ApiResponse<Domicilio>>(`${this.baseUrl}?id=${id}`, domicilio)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un domicilio por ID (404 si no existe, 409 si lo referencia un pedido).
   * @param id ID del domicilio
   */
  deleteDomicilio(id: number): Observable<ApiResponse<undefined>> {
    return this.http
      .delete<ApiResponse<undefined>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Asigna un domiciliario a un domicilio (lo pasa a EN_CAMINO). Responde 409 si ya estaba
   * asignado y 404 si el domicilio o el trabajador no existen. `data` es el domicilio completo.
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
