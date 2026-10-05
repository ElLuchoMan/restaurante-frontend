import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PaginatedData } from '../../shared/models/descuento-types.model';
import {
  AsociarProductoRequest,
  CrearOfertaRequest,
  Oferta,
  OfertaActiva,
  OfertaActivasParams,
  OfertaParams,
} from '../../shared/models/oferta.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de /ofertas. En el back el id va SIEMPRE como query param `id` (no existen rutas
 * `/ofertas/{id}`); todas las rutas salvo `/ofertas/activas` requieren token.
 */
@Injectable({ providedIn: 'root' })
export class OfertaService {
  private baseUrl = `${environment.apiUrl}/ofertas`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  crear(body: CrearOfertaRequest): Observable<ApiResponse<Oferta>> {
    return this.http
      .post<ApiResponse<Oferta>>(`${this.baseUrl}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /** El back devuelve un envoltorio paginado (no un array) dentro de `data`. */
  listar(params?: OfertaParams): Observable<ApiResponse<PaginatedData<Oferta>>> {
    return this.http
      .get<ApiResponse<PaginatedData<Oferta>>>(`${this.baseUrl}`, {
        params: this.toHttpParams(params),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  obtener(id: number): Observable<ApiResponse<Oferta>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<Oferta>>(`${this.baseUrl}/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** El back exige el cuerpo completo (tipo, fechas y restaurante), no una actualización parcial. */
  actualizar(id: number, body: CrearOfertaRequest): Observable<ApiResponse<Oferta>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Oferta>>(`${this.baseUrl}`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** Público (sin token). `data` es `null` cuando no hay ofertas activas. */
  obtenerActivas(params: OfertaActivasParams): Observable<ApiResponse<OfertaActiva[] | null>> {
    return this.http
      .get<ApiResponse<OfertaActiva[] | null>>(`${this.baseUrl}/activas`, {
        params: this.toHttpParams(params),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  asociarProducto(
    ofertaId: number,
    body: AsociarProductoRequest,
  ): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(ofertaId));
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/productos`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  desasociarProducto(ofertaId: number, productoId: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams()
      .set('id', String(ofertaId))
      .set('producto_id', String(productoId));
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}/productos`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** DELETE /ofertas?id= desactiva la oferta (baja lógica); 400 si ya estaba inactiva. */
  desactivar(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  private toHttpParams(params?: object): HttpParams {
    let hp = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v != null && (hp = hp.set(k, String(v))));
    return hp;
  }
}
