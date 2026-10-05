import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { RestauranteDia } from '../../shared/models/restaurante-dia.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class RestauranteDiaService {
  private baseUrl = `${environment.apiUrl}/restaurante_dia`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(restaurante_id?: number, dia?: string): Observable<ApiResponse<RestauranteDia[]>> {
    let params = new HttpParams();
    if (restaurante_id !== undefined) params = params.set('restaurante_id', String(restaurante_id));
    if (dia) params = params.set('dia', dia);
    return this.http
      .get<ApiResponse<RestauranteDia[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getById(id: number): Observable<ApiResponse<RestauranteDia>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<RestauranteDia>>(`${this.baseUrl}/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
