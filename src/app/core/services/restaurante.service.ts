import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';
import { Restaurante } from '../../shared/models/restaurante.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de solo lectura de `/restaurantes` (públicos, sin token). El back no expone rutas
 * de alta, edición ni baja de restaurantes. Si el restaurante no existe responde HTTP 200 con
 * `code: 404` y sin `data`.
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

  getRestauranteInfo(): Observable<ApiResponse<Restaurante | undefined>> {
    return this.http
      .get<ApiResponse<Restaurante | undefined>>(`${this.baseUrl}/restaurantes/search?id=1`)
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /cambios_horario/actual (público). Sin cambio para hoy: `code: 404` y sin `data`. */
  getCambiosHorario(): Observable<ApiResponse<CambioHorario | undefined>> {
    return this.http
      .get<ApiResponse<CambioHorario | undefined>>(`${this.baseUrl}/cambios_horario/actual`)
      .pipe(catchError(this.handleError.handleError));
  }

  listRestaurantes(): Observable<ApiResponse<Restaurante[]>> {
    return this.http
      .get<ApiResponse<Restaurante[]>>(`${this.baseUrl}/restaurantes`)
      .pipe(catchError(this.handleError.handleError));
  }
}
