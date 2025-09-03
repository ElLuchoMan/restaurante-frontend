import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Pago, PagoCreate, PagoUpdate } from '../../shared/models/pago.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private baseUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient, private handleError: HandleErrorService) {}

  createPago(payload: PagoCreate): Observable<ApiResponse<Pago>> {
    console.log('Creating pago with payload:', payload);
    return this.http
      .post<ApiResponse<Pago>>(this.baseUrl, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  getPagos(params?: any): Observable<ApiResponse<Pago[]>> {
    return this.http
      .get<ApiResponse<Pago[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getPagoById(id: number): Observable<ApiResponse<Pago>> {
    return this.http
      .get<ApiResponse<Pago>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  updatePago(id: number, payload: PagoUpdate): Observable<ApiResponse<Pago>> {
    return this.http
      .put<ApiResponse<Pago>>(`${this.baseUrl}?id=${id}`, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  deletePago(id: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
