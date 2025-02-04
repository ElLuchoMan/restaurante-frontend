import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva } from '../../shared/models/reserva.model';
import { UserService } from '../../core/services/user.service';
import { HandleErrorService } from '../../core/services/handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private userService: UserService, private handleError: HandleErrorService) { }

  crearReserva(reserva: Reserva): Observable<ApiResponse<Reserva>> {
    return this.http.post<ApiResponse<Reserva>>(`${this.baseUrl}/reservas`, reserva).pipe(
      catchError(this.handleError.handleError)
    );
  }

  obtenerReservas(): Observable<ApiResponse<Reserva[]>> {
    return this.http.get<ApiResponse<Reserva[]>>(`${this.baseUrl}/reservas`).pipe(
      catchError(this.handleError.handleError)
    );
  }
}
