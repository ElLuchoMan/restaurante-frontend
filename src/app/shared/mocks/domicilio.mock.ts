import { estadoPago } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Domicilio, DomicilioRequest } from '../models/domicilio.model';

export const mockDomicilioRespone: ApiResponse<Domicilio> = {
  code: 200,
  message: 'Domicilio encontrado',
  data: {
    fechaDomicilio: '25-12-2024',
    createdAt: '16-01-2025 02:15:05',
    updatedAt: '16-01-2025 02:15:05',
    domicilioId: 1,
    direccion: 'Carrera 110 # 75 -16',
    telefono: '3042449339',
    estadoPago: estadoPago.PAGADO,
    entregado: true,
    observaciones: 'Entrega puntual',
    createdBy: 'Administrador - Bryan Luis',
    updatedBy: 'Administrador - Bryan Luis',
  },
};

export const mockDomiciliosRespone: ApiResponse<Domicilio[]> = {
  code: 200,
  message: 'Domicilios obtenidos exitosamente',
  data: [
    {
      fechaDomicilio: ' 25-12-2024',
      createdAt: '16-01-2025 02:15:05',
      updatedAt: '16-01-2025 02:15:05',
      domicilioId: 1,
      direccion: 'Carrera 110 # 75 -16',
      telefono: '3042449339',
      estadoPago: estadoPago.PAGADO,
      entregado: true,
      observaciones: 'Entrega puntual',
      createdBy: 'Administrador - Bryan Luis',
      updatedBy: 'Administrador - Bryan Luis',
    },
    {
      fechaDomicilio: '30-12-2024',
      createdAt: '16-01-2025 02:15:05',
      updatedAt: '16-01-2025 02:15:05',
      domicilioId: 2,
      direccion: 'Carrera 45 #10-20',
      telefono: '3006543210',
      estadoPago: estadoPago.PENDIENTE,
      entregado: false,
      observaciones: 'Requiere cambio',
      createdBy: 'Administrador - Bryan Luis',
      updatedBy: 'Administrador - Bryan Luis',
    },
  ],
};

export const mockDomicilioBody: DomicilioRequest = {
  fechaDomicilio: '2024-12-30',
  direccion: 'Carrera 45 #10-20',
  telefono: '3006543210',
  estadoPago: estadoPago.PENDIENTE,
  observaciones: 'Requiere cambio',
  createdBy: 'Administrador - Bryan Luis',
};
