import { estadoProducto } from "../constants";

export interface Producto {
    productoId?: number;
    nombre: string;
    calorias?: number;
    descripcion?: string;
    precio: number;
    estadoProducto?: estadoProducto;
    imagen?: File | string;
    cantidad: number;
    categoria?: string;
    subcategoria?: string;
}

export interface DetallesProducto {
    cantidad: number;
    nombre: string;
    precioUnitario: number;
    productoId: number;
    subtotal: number;
}