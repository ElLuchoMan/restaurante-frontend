import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';
import { Pago } from '../../shared/models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private baseUrl = `${environment.apiUrl}/pagos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService
  ) {}

  /**
   * Crear un pago (JSON camelCase según Swagger).
   * Requiere: fechaPago (YYYY-MM-DD), horaPago (HH:mm:ss), monto, estadoPago, metodoPagoId.
   */
  createPago(payload: Pago): Observable<ApiResponse<Pago>> {
    return this.http.post<ApiResponse<Pago>>(this.baseUrl, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Listar pagos con filtros opcionales.
   * Filtros soportados según tu backend: fecha (YYYY-MM-DD), dia (1-31), mes (1-12),
   * anio (YYYY), estado (PAGADO|PENDIENTE|NO PAGO), metodo_pago (id numérico).
   */
  getPagos(params?: {
    fecha?: string;
    dia?: number;
    mes?: number;
    anio?: number;
    estado?: string;
    metodo_pago?: number;
  }): Observable<ApiResponse<Pago[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<ApiResponse<Pago[]>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtener un pago por ID.
   */
  getPagoById(id: number): Observable<ApiResponse<Pago>> {
    const params = new HttpParams().set('id', String(id));
    return this.http.get<ApiResponse<Pago>>(`${this.baseUrl}/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualizar un pago por ID (parcial).
   * Acepta el mismo contrato camelCase: { fechaPago?, horaPago?, monto?, estadoPago?, metodoPagoId?, updatedBy? }
   */
  updatePago(id: number, changes: Partial<Pago>): Observable<ApiResponse<Pago>> {
    return this.http.put<ApiResponse<Pago>>(`${this.baseUrl}?id=${id}`, changes)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Eliminar un pago por ID.
   */
  deletePago(id: number): Observable<ApiResponse<Pago>> {
    return this.http.delete<ApiResponse<Pago>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
