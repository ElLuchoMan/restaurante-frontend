import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DiaSemana } from '../../shared/constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import { RestauranteDia } from '../../shared/models/restaurante-dia.model';
import { HandleErrorService } from './handle-error.service';

/** Cliente de solo lectura de `/restaurante_dia` (público, sin token). */
@Injectable({ providedIn: 'root' })
export class RestauranteDiaService {
  private baseUrl = `${environment.apiUrl}/restaurante_dia`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(restaurante_id?: number, dia?: DiaSemana): Observable<ApiResponse<RestauranteDia[]>> {
    let params = new HttpParams();
    if (restaurante_id !== undefined) params = params.set('restaurante_id', String(restaurante_id));
    if (dia) params = params.set('dia', dia);
    return this.http
      .get<ApiResponse<RestauranteDia[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /restaurante_dia/search?id=. El `id` es el de la fila de `restaurante_dia`, que el back
   * no incluye en las respuestas. Si no existe: `code: 404` y sin `data`.
   */
  getById(id: number): Observable<ApiResponse<RestauranteDia | undefined>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<RestauranteDia | undefined>>(`${this.baseUrl}/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
