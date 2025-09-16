import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';

export interface PrecioProductoHistDTO {
  productoId?: number;
  precio?: number;
  fechaVigencia?: string;
  estadoProducto?: string;
}

@Injectable({ providedIn: 'root' })
export class PrecioProductoHistService {
  private baseUrl = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(producto_id?: number, fecha?: string): Observable<ApiResponse<PrecioProductoHistDTO[]>> {
    let params = new HttpParams();
    if (producto_id) params = params.set('producto_id', String(producto_id));
    if (fecha) params = params.set('fecha', fecha);
    return this.http
      .get<ApiResponse<PrecioProductoHistDTO[]>>(`${this.baseUrl}/precio_producto_hist`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getById(id: number): Observable<ApiResponse<PrecioProductoHistDTO>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<
        ApiResponse<PrecioProductoHistDTO>
      >(`${this.baseUrl}/precio_producto_hist/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
