import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';
import { Restaurante } from '../../shared/models/restaurante.model';
import { HandleErrorService } from './handle-error.service';
import { notFoundAsEmpty } from './not-found.operator';

/**
 * Cliente de solo lectura de `/restaurantes` (públicos, sin token). El back no expone rutas
 * de alta, edición ni baja de restaurantes. Si el restaurante no existe responde 404.
 */
@Injectable({
  providedIn: 'root',
})
export class RestauranteService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  getRestauranteInfo(): Observable<ApiResponse<Restaurante>> {
    return this.http
      .get<ApiResponse<Restaurante>>(`${this.baseUrl}/restaurantes/search?id=1`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /cambios_horario/actual (público). Sin cambio para hoy el back responde 404 HTTP; se
   * expone como `{ code: 404, data: undefined }` (sin cambio, no un error visible).
   */
  getCambiosHorario(): Observable<ApiResponse<CambioHorario | undefined>> {
    return this.http
      .get<ApiResponse<CambioHorario>>(`${this.baseUrl}/cambios_horario/actual`)
      .pipe(
        notFoundAsEmpty<CambioHorario>('No hay cambios de horario para la fecha actual'),
        catchError(this.handleError.handleError),
      );
  }

  listRestaurantes(): Observable<ApiResponse<Restaurante[]>> {
    return this.http
      .get<ApiResponse<Restaurante[]>>(`${this.baseUrl}/restaurantes`)
      .pipe(catchError(this.handleError.handleError));
  }
}
