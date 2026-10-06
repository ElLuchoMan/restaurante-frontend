import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  ActualizarCuponRequest,
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
 * Cliente de /cupones (todas las rutas requieren token). Permisos: gestionar y consultar cupones
 * (`crear`, `listar`, `obtener`, `actualizar`, `desactivar`, `listarRedenciones`) es solo del
 * Administrador (403 para cualquier otro rol); `validar` y `redimir` los puede usar cualquier
 * usuario autenticado y el cliente SALE DEL TOKEN (un Cliente no envía `clienteId`). En el back el
 * id va como query param `id` (no existen rutas `/cupones/{id}`). Los errores llegan con su status
 * HTTP real (400, 401, 403, 404, 409 código duplicado/agotado/ya redimido, 422 validación de
 * negocio, 500) y `HandleErrorService` conserva `message`.
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

  /**
   * PUT con merge: lo ausente se conserva; `null` limpia sólo los campos anulables y
   * `activo: true` reactiva el cupón.
   */
  actualizar(id: number, body: ActualizarCuponRequest): Observable<ApiResponse<Cupon>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Cupon>>(`${this.baseUrl}`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * 200 con `aplicable` true/false; 400 si faltan `codigo`, `items`/`pedidoId` o (trabajador)
   * `clienteId`; 403 si `clienteId` no es el del token o el pedido es de otro cliente; 404 si el
   * pedido no existe; 500 error de servicio.
   */
  validar(body: ValidarCuponRequest): Observable<ApiResponse<ValidarCuponResponse>> {
    return this.http
      .post<ApiResponse<ValidarCuponResponse>>(`${this.baseUrl}/validar`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * POST /cupones/{codigo}/redimir. Solo registra la redención (para aplicar el descuento y
   * recalcular el total del pedido use `DescuentoService.aplicar`). 400 ids inválidos o (trabajador)
   * `clienteId` ausente, 403 `clienteId` distinto del token o pedido de otro cliente, 404
   * cupón/pedido inexistente, 409 cupón agotado, límite por cliente alcanzado, ya redimido en el
   * pedido o pedido cerrado, 422 cupón no aplicable, 500 error interno.
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

  /** DELETE /cupones?id= desactiva el cupón (baja lógica); 400 si ya estaba inactivo. */
  desactivar(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
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
