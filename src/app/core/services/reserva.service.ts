import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva } from '../../shared/models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private handleError: HandleErrorService,
  ) {}

  crearReserva(reserva: Reserva): Observable<ApiResponse<Reserva>> {
    return this.http
      .post<ApiResponse<Reserva>>(`${this.baseUrl}/reservas`, reserva)
      .pipe(catchError(this.handleError.handleError));
  }

  obtenerReservas(): Observable<ApiResponse<Reserva[]>> {
    return this.http
      .get<ApiResponse<Reserva[]>>(`${this.baseUrl}/reservas`)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarReserva(reservaId: number, reserva: Reserva): Observable<ApiResponse<Reserva>> {
    return this.http
      .put<ApiResponse<Reserva>>(`${this.baseUrl}/reservas?id=${reservaId}`, reserva)
      .pipe(catchError(this.handleError.handleError));
  }

  getReservaByParameter(
    documentoCliente?: number,
    fecha?: string,
  ): Observable<ApiResponse<Reserva[]>> {
    let params = new HttpParams();

    if (documentoCliente !== undefined && !isNaN(documentoCliente)) {
      params = params.set('documentoCliente', documentoCliente.toString());
    }

    if (fecha) {
      params = params.set('fecha', fecha);
    }

    return this.http
      .get<ApiResponse<Reserva[]>>(`${this.baseUrl}/reservas/parameter`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
