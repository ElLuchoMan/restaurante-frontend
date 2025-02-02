import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
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

  // BehaviorSubject para manejar el estado del usuario
  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  // Permite a los componentes suscribirse al estado de autenticación
  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }

  // Verifica si hay un token activo
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

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

  // Guardar token y notificar cambio de estado
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authState.next(true); // Notifica el cambio
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

  // Obtener id del usuario
  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.documento : null;
  }

  // Validar si el token ha expirado
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(new Date().getTime() / 1000);
    return decoded.exp < currentTime;
  }

  // Cerrar sesión y notificar cambio de estado
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authState.next(false); // Notifica el cambio
  }

  // Validar la validez del token y cerrar sesión si ha expirado
  validateTokenAndLogout(): string | null {
    const token = this.getToken();
    if (token && this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return token;
  }
}
