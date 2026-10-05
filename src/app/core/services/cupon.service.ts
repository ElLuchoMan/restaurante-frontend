import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  CrearCuponRequest,
  Cupon,
  CuponParams,
  CuponRedencion,
  CuponRedencionParams,
  RedimirCuponRequest,
  ValidarCuponRequest,
  ValidarCuponResponse,
} from '../../shared/models/cupon.model';
import { PaginatedData } from '../../shared/models/descuento-types.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de /cupones (todas las rutas requieren token). En el back el id va como query param
 * `id` (no existen rutas `/cupones/{id}`).
 */
@Injectable({ providedIn: 'root' })
export class CuponService {
  private baseUrl = `${environment.apiUrl}/cupones`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  crear(body: CrearCuponRequest): Observable<ApiResponse<Cupon>> {
    return this.http
      .post<ApiResponse<Cupon>>(`${this.baseUrl}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /** El back devuelve un envoltorio paginado (no un array) dentro de `data`. */
  listar(params?: CuponParams): Observable<ApiResponse<PaginatedData<Cupon>>> {
    return this.http
      .get<ApiResponse<PaginatedData<Cupon>>>(`${this.baseUrl}`, {
        params: this.toHttpParams(params),
      })
      .pipe(catchError(this.handleError.handleError));
  }

  /** `/cupones/search` acepta el id numérico o el código del cupón en `id`. */
  obtener(idOrCodigo: number | string): Observable<ApiResponse<Cupon>> {
    const params = new HttpParams().set('id', String(idOrCodigo));
    return this.http
      .get<ApiResponse<Cupon>>(`${this.baseUrl}/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** El back exige el cuerpo completo (scope, tipo y fechas), no una actualización parcial. */
  actualizar(id: number, body: CrearCuponRequest): Observable<ApiResponse<Cupon>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Cupon>>(`${this.baseUrl}`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  validar(body: ValidarCuponRequest): Observable<ApiResponse<ValidarCuponResponse>> {
    return this.http
      .post<ApiResponse<ValidarCuponResponse>>(`${this.baseUrl}/validar`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * OJO: el contrato documentado es POST /cupones/{codigo}/redimir, pero el router del back sólo
   * registra `/cupones/redimir` (sin `:codigo`), por lo que esta llamada no funciona hasta que
   * el back añada la ruta con el parámetro de ruta.
   */
  redimir(codigo: string, body: RedimirCuponRequest): Observable<ApiResponse<CuponRedencion>> {
    return this.http
      .post<ApiResponse<CuponRedencion>>(
        `${this.baseUrl}/${encodeURIComponent(codigo)}/redimir`,
        body,
      )
      .pipe(catchError(this.handleError.handleError));
  }

  /** El back devuelve un envoltorio paginado (no un array) dentro de `data`. */
  listarRedenciones(
    params?: CuponRedencionParams,
  ): Observable<ApiResponse<PaginatedData<CuponRedencion>>> {
    return this.http
      .get<ApiResponse<PaginatedData<CuponRedencion>>>(`${this.baseUrl}/redenciones`, {
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
}
