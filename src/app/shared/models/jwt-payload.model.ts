export interface JwtPayload {
    rol: string;
    exp: number;
    documento: number;
    nombre?: string;
}
