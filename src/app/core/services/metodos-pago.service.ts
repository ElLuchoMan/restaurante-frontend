import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  MetodoPagoCreate,
  MetodoPagoUpdate,
  MetodosPago,
} from '../../shared/models/metodo-pago.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/metodos_pago` (requiere token). El back usa el status HTTP real (403 si quien
 * crea, edita o elimina no es Administrador, 404 si el método no existe, 409 al eliminar uno
 * referenciado por pagos) y la lista vacía responde `data: []`. Leer está abierto a cualquier
 * sesión (el carrito del cliente lista los métodos).
 */
@Injectable({
  providedIn: 'root',
})
export class MetodosPagoService {
  private baseUrl = `${environment.apiUrl}/metodos_pago`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * Obtiene todos los métodos de pago
   */
  getAll(): Observable<ApiResponse<MetodosPago[]>> {
    return this.http
      .get<ApiResponse<MetodosPago[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene un método de pago por ID
   */
  getById(id: number): Observable<ApiResponse<MetodosPago>> {
    return this.http
      .get<ApiResponse<MetodosPago>>(`${this.baseUrl}/search`, {
        params: { id: id.toString() },
      })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Crea un método de pago
   */
  create(body: MetodoPagoCreate): Observable<ApiResponse<MetodosPago>> {
    return this.http
      .post<ApiResponse<MetodosPago>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualiza un método de pago por ID con merge (se puede enviar solo `tipo` o solo `detalle`)
   */
  update(id: number, body: MetodoPagoUpdate): Observable<ApiResponse<MetodosPago>> {
    return this.http
      .put<ApiResponse<MetodosPago>>(`${this.baseUrl}?id=${id}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un método de pago por ID (409 si lo referencian pagos)
   */
  delete(id: number): Observable<ApiResponse<undefined>> {
    return this.http
      .delete<ApiResponse<undefined>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
