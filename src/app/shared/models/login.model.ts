export interface LoginResponse {
  token: string; // mantener compatibilidad hacia atrás
  access_token: string;
  refresh_token: string;
  nombre: string;
  rol?: string;
}
export interface Login {
  documento: number;
  password: string;
}
