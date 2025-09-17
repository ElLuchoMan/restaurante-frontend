import { estadoDomicilio } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Domicilio, DomicilioRequest } from '../models/domicilio.model';

export const mockDomicilioRespone: ApiResponse<Domicilio> = {
  code: 200,
  message: 'Domicilio encontrado',
  data: {
    fechaDomicilio: '2024-12-25',
    createdAt: '2025-01-16 02:15:05',
    updatedAt: '2025-01-16 02:15:05',
    domicilioId: 1,
    direccion: 'Carrera 110 # 75 -16',
    telefono: '3042449339',
    estadoDomicilio: estadoDomicilio.ENTREGADO,
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
      fechaDomicilio: '2024-12-25',
      createdAt: '2025-01-16 02:15:05',
      updatedAt: '2025-01-16 02:15:05',
      domicilioId: 1,
      direccion: 'Carrera 110 # 75 -16',
      telefono: '3042449339',
      estadoDomicilio: estadoDomicilio.ENTREGADO,
      entregado: true,
      observaciones: 'Entrega puntual',
      createdBy: 'Administrador - Bryan Luis',
      updatedBy: 'Administrador - Bryan Luis',
    },
    {
      fechaDomicilio: '2024-12-30',
      createdAt: '2025-01-16 02:15:05',
      updatedAt: '2025-01-16 02:15:05',
      domicilioId: 2,
      direccion: 'Carrera 45 #10-20',
      telefono: '3006543210',
      estadoDomicilio: estadoDomicilio.EN_CAMINO,
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
  estadoDomicilio: estadoDomicilio.PENDIENTE,
  observaciones: 'Requiere cambio',
  createdBy: 'Administrador - Bryan Luis',
};

export const mockDomicilioUpdateBody: Partial<DomicilioRequest> = {
  telefono: '3003334455',
};

export const mockDomicilioUpdateResponse: ApiResponse<Domicilio> = {
  code: 200,
  message: 'Domicilio actualizado',
  data: {
    ...mockDomicilioRespone.data,
    telefono: '3003334455',
  },
};

export const mockDomicilioDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Domicilio eliminado',
  data: {},
};
