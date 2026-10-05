import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  NominaTrabajador,
  NominaTrabajadorCreada,
  NominaTrabajadorDetalle,
} from '../../shared/models/nomina-trabajador.model';
import { HandleErrorService } from './handle-error.service';

export interface NominaTrabajadorRequest {
  documentoTrabajador: number;
  /** El backend lo acepta pero lo ignora: genera el detalle a partir del mes de la última nómina. */
  detalles?: string;
}

export interface NominaTrabajadorSearchParams {
  /** Obligatorio en el backend. */
  documento: number;
  actual?: boolean;
  pagas?: boolean;
  no_pagas?: boolean;
  /** `mes` y `anio` solo filtran si se envían ambos. */
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

  /** GET /nomina_trabajador (requiere token). */
  list(): Observable<ApiResponse<NominaTrabajador[] | null>> {
    return this.http
      .get<ApiResponse<NominaTrabajador[] | null>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /nomina_trabajador/mes: `mes` (1-12) y `anio` son obligatorios.
   * Sin resultados responde 200 con `code: 404` y sin `data`.
   */
  listMes(
    mes: number,
    anio: number,
  ): Observable<ApiResponse<NominaTrabajadorDetalle[] | undefined>> {
    const params = new HttpParams().set('mes', String(mes)).set('anio', String(anio));
    return this.http
      .get<ApiResponse<NominaTrabajadorDetalle[] | undefined>>(`${this.baseUrl}/mes`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /nomina_trabajador/search: `documento` es obligatorio.
   * Sin resultados responde 200 con `code: 404` y sin `data`.
   */
  search(
    params: NominaTrabajadorSearchParams,
  ): Observable<ApiResponse<NominaTrabajador[] | undefined>> {
    let hp = new HttpParams().set('documento', String(params.documento));
    if (params.actual !== undefined) hp = hp.set('actual', String(params.actual));
    if (params.pagas !== undefined) hp = hp.set('pagas', String(params.pagas));
    if (params.no_pagas !== undefined) hp = hp.set('no_pagas', String(params.no_pagas));
    if (params.mes !== undefined) hp = hp.set('mes', String(params.mes));
    if (params.anio !== undefined) hp = hp.set('anio', String(params.anio));
    return this.http
      .get<ApiResponse<NominaTrabajador[] | undefined>>(`${this.baseUrl}/search`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * POST /nomina_trabajador. 201 con la relación creada; si ya existía para la última nómina
   * responde 200 con la relación existente (forma de `NominaTrabajador`).
   */
  create(
    body: NominaTrabajadorRequest,
  ): Observable<ApiResponse<NominaTrabajadorCreada | NominaTrabajador>> {
    return this.http
      .post<ApiResponse<NominaTrabajadorCreada | NominaTrabajador>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }
}
