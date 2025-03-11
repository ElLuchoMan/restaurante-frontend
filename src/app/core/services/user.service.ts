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

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(credenciales: Login): Observable<ApiResponse<LoginResonse>> {
    return this.http.post<ApiResponse<LoginResonse>>(`${this.baseUrl}/login`, credenciales).pipe(
      catchError(this.handleError.handleError)
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authState.next(true);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

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

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.rol : null;
  }

  getUserId(): number {
    const decoded = this.decodeToken();
    return decoded ? decoded.documento : 0;
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(new Date().getTime() / 1000);
    return decoded.exp < currentTime;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authState.next(false);
  }

  validateTokenAndLogout(): string | null {
    const token = this.getToken();
    if (token && this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return token;
  }
}
