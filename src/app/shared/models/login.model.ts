export interface LoginResponse {
  token: string;
  nombre: string;
  rol?: string;
}
export interface Login {
  documento: number;
  password: string;
}
