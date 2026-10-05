import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PaginatedData } from '../../shared/models/descuento-types.model';
import {
  ActualizarOfertaRequest,
  AsociarProductoRequest,
  CrearOfertaRequest,
  Oferta,
  OfertaActiva,
  OfertaActivasParams,
  OfertaParams,
  OfertaProductoAsociacion,
} from '../../shared/models/oferta.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de /ofertas. En el back el id va SIEMPRE como query param `id` (no existen rutas
 * `/ofertas/{id}`); todas las rutas salvo `/ofertas/activas` requieren token. Crear, actualizar,
 * desactivar y asociar/desasociar productos es solo del Administrador (403 para otros roles). Los
 * errores llegan con su status HTTP real (400 validación/FK inválida, 401 sin sesión, 403 sin
 * permiso, 404 no existe, 409 título duplicado o producto ya asociado, 422 regla de negocio) y
 * `HandleErrorService` conserva `message`.
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

  /**
   * PUT con merge: lo ausente se conserva; `horaInicio`/`horaFin` aceptan `null` para quitar el
   * horario y `activo: true` reactiva la oferta.
   */
  actualizar(id: number, body: ActualizarOfertaRequest): Observable<ApiResponse<Oferta>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Oferta>>(`${this.baseUrl}`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** Público (sin token). `data` es `[]` cuando no hay ofertas activas. */
  obtenerActivas(params: OfertaActivasParams): Observable<ApiResponse<OfertaActiva[]>> {
    return this.http
      .get<ApiResponse<OfertaActiva[]>>(`${this.baseUrl}/activas`, {
        params: this.toHttpParams(params),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  /** 404 si la oferta o el producto no existen; 409 si ya estaba asociado. */
  asociarProducto(
    ofertaId: number,
    body: AsociarProductoRequest,
  ): Observable<ApiResponse<OfertaProductoAsociacion>> {
    const params = new HttpParams().set('id', String(ofertaId));
    return this.http
      .post<ApiResponse<OfertaProductoAsociacion>>(`${this.baseUrl}/productos`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** 404 si la oferta o la asociación no existen. */
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
