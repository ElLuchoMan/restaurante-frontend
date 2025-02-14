import { estadoPago } from "../constants";

export interface Domicilio {
    fechaDomicilio: string;
    createdAt?: string;
    updatedAt?: string;
    domicilioId?: number;
    direccion: string;
    telefono: string;
    estadoPago: estadoPago;
    entregado: boolean;
    observaciones: string;
    createdBy: string;
    updatedBy?: string;
    trabajadorAsignado?: number;
}
