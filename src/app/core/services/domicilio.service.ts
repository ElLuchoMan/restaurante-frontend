import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Domicilio,
  DomicilioDetalle,
  DomicilioRequest,
} from '../../shared/models/domicilio.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class DomicilioService {
  private baseUrl = `${environment.apiUrl}/domicilios`;

  constructor(private http: HttpClient, private handleError: HandleErrorService) {}

  /**
   * Obtiene todos los domicilios según filtros
   * @param params
   * @returns
   */
  getDomicilios(params?: any): Observable<ApiResponse<Domicilio[]>> {
    return this.http
      .get<ApiResponse<Domicilio[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene un domicilio por ID.
   * @param id ID del domicilio
   */
  getDomicilioById(id: number): Observable<ApiResponse<DomicilioDetalle>> {
    return this.http
      .get<ApiResponse<DomicilioDetalle>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Crea un nuevo domicilio.
   * @param domicilio Datos del domicilio a crear
   */
  createDomicilio(domicilio: DomicilioRequest): Observable<ApiResponse<Domicilio>> {
    return this.http
      .post<ApiResponse<Domicilio>>(this.baseUrl, domicilio)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualiza un domicilio existente.
   * @param id ID del domicilio
   * @param domicilio Datos actualizados
   */
  updateDomicilio(
    id: number,
    domicilio: Partial<DomicilioRequest>,
  ): Observable<ApiResponse<Domicilio>> {
    return this.http
      .put<ApiResponse<Domicilio>>(`${this.baseUrl}?id=${id}`, domicilio)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un domicilio por ID.
   * @param id ID del domicilio
   */
  deleteDomicilio(id: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
  /**
   * Asigna un domiciliario a un domicilio
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
