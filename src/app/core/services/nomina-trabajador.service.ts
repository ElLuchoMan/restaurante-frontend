import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  NominaTrabajadorDetalle,
  NominaTrabajadorItem,
} from '../../shared/models/nomina-trabajador.model';
import { HandleErrorService } from './handle-error.service';

/** Body de POST /nomina_trabajador: sueldo, incidencias y detalle los calcula el backend. */
export interface NominaTrabajadorRequest {
  documentoTrabajador: number;
}

export interface NominaTrabajadorSearchParams {
  /** Obligatorio en el backend. */
  documento: number;
  actual?: boolean;
  /** No puede combinarse con `no_pagas` (400). */
  pagas?: boolean;
  /** No puede combinarse con `pagas` (400). */
  no_pagas?: boolean;
  /** `mes` (1-12) y `anio` filtran por la fecha de la nómina, juntos o por separado. */
  mes?: number;
  anio?: number;
}

@Injectable({ providedIn: 'root' })
export class NominaTrabajadorService {
  private baseUrl = `${environment.apiUrl}/nomina_trabajador`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /** GET /nomina_trabajador (requiere token). Sin relaciones responde 200 con `data: []`. */
  list(): Observable<ApiResponse<NominaTrabajadorItem[]>> {
    return this.http
      .get<ApiResponse<NominaTrabajadorItem[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /nomina_trabajador/mes. `mes` (1-12) y `anio` son opcionales e independientes (cada uno por defecto el actual);
   * valores inválidos responden 400. Sin resultados responde 200 con `data: []`.
   */
  listMes(mes?: number, anio?: number): Observable<ApiResponse<NominaTrabajadorDetalle[]>> {
    let params = new HttpParams();
    if (mes !== undefined) params = params.set('mes', String(mes));
    if (anio !== undefined) params = params.set('anio', String(anio));
    return this.http
      .get<ApiResponse<NominaTrabajadorDetalle[]>>(`${this.baseUrl}/mes`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /nomina_trabajador/search: `documento` es obligatorio; los filtros inválidos o
   * incompatibles (pagas y no_pagas a la vez) responden 400. Sin resultados: `data: []`.
   */
  search(params: NominaTrabajadorSearchParams): Observable<ApiResponse<NominaTrabajadorItem[]>> {
    let hp = new HttpParams().set('documento', String(params.documento));
    if (params.actual !== undefined) hp = hp.set('actual', String(params.actual));
    if (params.pagas !== undefined) hp = hp.set('pagas', String(params.pagas));
    if (params.no_pagas !== undefined) hp = hp.set('no_pagas', String(params.no_pagas));
    if (params.mes !== undefined) hp = hp.set('mes', String(params.mes));
    if (params.anio !== undefined) hp = hp.set('anio', String(params.anio));
    return this.http
      .get<ApiResponse<NominaTrabajadorItem[]>>(`${this.baseUrl}/search`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * POST /nomina_trabajador. 201 con la relación creada; si ya existía para la última nómina
   * responde 200 con la existente (misma forma, `NominaTrabajadorItem`). Errores: 404 trabajador
   * inexistente, 422 sin ninguna nómina generada y 409 duplicado por concurrencia.
   */
  create(body: NominaTrabajadorRequest): Observable<ApiResponse<NominaTrabajadorItem>> {
    return this.http
      .post<ApiResponse<NominaTrabajadorItem>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }
}
