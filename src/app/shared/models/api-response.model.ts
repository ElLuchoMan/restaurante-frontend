export interface ApiResponse<T> {
  code: number;
  message: string;
  cause?: string;
  data: T;
}
