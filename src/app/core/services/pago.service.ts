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

  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  createPago(payload: Pago) /*Observable<ApiResponse<Pago>>*/{
    return payload;
/*
    return this.http.post<ApiResponse<Pago>>(this.baseUrl, payload)
      .pipe(catchError(this.handleError.handleError));
*/
  }

  getPagos(params?: any): Observable<ApiResponse<Pago[]>> {
    return this.http.get<ApiResponse<Pago[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getPagoById(id: number): Observable<ApiResponse<Pago>> {
    return this.http.get<ApiResponse<Pago>>(`${this.baseUrl}/search?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  updatePago(id: number, payload: Partial<Pago>): Observable<ApiResponse<Pago>> {
    return this.http.put<ApiResponse<Pago>>(`${this.baseUrl}?id=${id}`, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  deletePago(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}?id=${id}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
