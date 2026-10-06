import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Trabajador,
  TrabajadorCreate,
  TrabajadorUpdate,
} from '../../shared/models/trabajador.model';
import { HandleErrorService } from './handle-error.service';
import { notFoundAsEmpty } from './not-found.operator';

@Injectable({
  providedIn: 'root',
})
export class TrabajadorService {
  private baseUrl = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * POST /trabajadores. Todo /trabajadores exige token de Administrador (401/403 si no).
   * Errores: 400 validación, 409 documento o teléfono repetido.
   */
  registroTrabajador(trabajador: TrabajadorCreate): Observable<ApiResponse<Trabajador>> {
    return this.http
      .post<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores`, trabajador)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /trabajadores/search?id= (solo Administrador). Si no existe el back responde 404 HTTP;
   * aquí se expone como `{ code: 404, data: undefined }`. 401/403 se propagan como error.
   */
  searchTrabajador(documento_trabajador: number): Observable<ApiResponse<Trabajador | undefined>> {
    return this.http
      .get<ApiResponse<Trabajador>>(
        `${this.baseUrl}/trabajadores/search?id=${documento_trabajador}`,
      )
      .pipe(
        notFoundAsEmpty<Trabajador>('Trabajador no encontrado'),
        catchError(this.handleError.handleError),
      );
  }

  /**
   * GET /trabajadores. Por defecto excluye retirados; `fecha_ingreso` va como YYYY-MM-DD.
   */
  getTrabajadores(params?: {
    fecha_ingreso?: string;
    rol?: string;
    incluir_retirados?: boolean;
    solo_retirados?: boolean;
  }): Observable<Trabajador[]> {
    let httpParams: HttpParams | undefined;
    if (params) {
      let hp = new HttpParams();
      if (params.fecha_ingreso) hp = hp.set('fecha_ingreso', params.fecha_ingreso);
      if (params.rol) hp = hp.set('rol', params.rol);
      if (params.incluir_retirados !== undefined)
        hp = hp.set('incluir_retirados', String(params.incluir_retirados));
      if (params.solo_retirados !== undefined)
        hp = hp.set('solo_retirados', String(params.solo_retirados));
      httpParams = hp;
    }

    return this.http
      .get<ApiResponse<Trabajador[] | null>>(`${this.baseUrl}/trabajadores`, {
        params: httpParams,
      })
      .pipe(
        map((res) => res.data ?? []),
        catchError(this.handleError.handleError),
      );
  }

  getTrabajadorId(documento: number): Observable<ApiResponse<Trabajador | undefined>> {
    return this.searchTrabajador(documento);
  }

  /** PUT /trabajadores?id= con merge. Errores: 400, 404 (no existe), 409 (teléfono repetido). */
  updateTrabajador(
    documento: number,
    partial: TrabajadorUpdate,
  ): Observable<ApiResponse<Trabajador>> {
    return this.http
      .put<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores?id=${documento}`, partial)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * DELETE /trabajadores: baja lógica (el back fija fechaRetiro = hoy y devuelve el trabajador).
   * Errores: 404 (no existe), 409 (ya estaba retirado).
   */
  deleteTrabajador(documento: number): Observable<ApiResponse<Trabajador>> {
    const params = new HttpParams().set('id', String(documento));
    return this.http
      .delete<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
