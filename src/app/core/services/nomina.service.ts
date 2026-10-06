import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Nomina, NominaCreate } from '../../shared/models/nomina.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class NominaService {
  private baseUrl = `${environment.apiUrl}/nominas`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * GET /nominas. Filtros opcionales: `fecha` (YYYY-MM-DD), `mes` (1-12) y `anio`; valores
   * inválidos responden 400. Sin coincidencias el backend responde 200 con `data: []`.
   */
  list(params?: { fecha?: string; mes?: number; anio?: number }): Observable<Nomina[]> {
    let hp: HttpParams | undefined;
    if (params) {
      let p = new HttpParams();
      if (params.fecha) p = p.set('fecha', params.fecha);
      if (params.mes !== undefined) p = p.set('mes', String(params.mes));
      if (params.anio !== undefined) p = p.set('anio', String(params.anio));
      hp = p;
    }
    return this.http.get<ApiResponse<Nomina[]>>(this.baseUrl, { params: hp }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  /**
   * PUT /nominas?id=: marca la nómina como PAGO y la devuelve. Si no existe el backend
   * responde 404 y se devuelve `null`; 409 si ya estaba en PAGO (se propaga como error `code` 409).
   */
  updateEstado(id: number): Observable<Nomina | null> {
    const params = new HttpParams().set('id', String(id));
    return this.http.put<ApiResponse<Nomina>>(this.baseUrl, {}, { params }).pipe(
      map((res) => res.data),
      catchError((error) =>
        error?.status === 404 ? of(null) : this.handleError.handleError(error),
      ),
    );
  }

  /**
   * POST /nominas. Body opcional (`nominaId` y `monto` se ignoran; `estadoNomina` inválido = 400).
   * 201 con la nómina creada; si el mes ya tenía una responde 200 con la existente (marcada
   * REGENERADA en control_nomina); 409 si ya hay una nómina con esa fecha. Día >= 20.
   */
  create(body: NominaCreate = {}): Observable<ApiResponse<Nomina>> {
    return this.http
      .post<ApiResponse<Nomina>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * DELETE /nominas?id=: borrado lógico (estado NO_PAGO); devuelve la nómina en `data`.
   * 404 si no existe y 409 si ya estaba en NO_PAGO (se propagan como error).
   */
  delete(id: number): Observable<ApiResponse<Nomina>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<Nomina>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
