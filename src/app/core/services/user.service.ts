import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Login, LoginResonse } from '../../shared/models/login.model';
import { Cliente } from '../../shared/models/cliente.model';
import { Trabajador } from '../../shared/models/trabajador.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  // Login
  login(credenciales: Login): Observable<ApiResponse<LoginResonse>> {
    return this.http.post<ApiResponse<LoginResonse>>(`${this.baseUrl}/login`, credenciales).pipe(
      catchError(this.handleError.handleError)
    );
  }

  // Registro de clientes
  registroCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes`, cliente).pipe(
      catchError(this.handleError.handleError)
    );
  }

  // Registro de trabajadores
  registroTrabajador(trabajador: Trabajador): Observable<ApiResponse<Trabajador>> {
    return this.http.post<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores`, trabajador).pipe(
      catchError(this.handleError.handleError)
    );
  }

  // Guardar token
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtener token
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  // Decodificar token
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = atob(token.split('.')[1]);
      return JSON.parse(payload);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
  

  // Obtener rol del usuario
  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.rol : null;
  }

  // Validar si el token ha expirado
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(new Date().getTime() / 1000);
    return decoded.exp < currentTime;
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
