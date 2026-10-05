import { ApiResponse } from '../models/api-response.model';
import {
  Cliente,
  ClienteCreate,
  ClienteListParams,
  ClienteResumen,
  ClienteUpdate,
} from '../models/cliente.model';

export const mockResponseCliente: ApiResponse<Cliente> = {
  code: 200,
  message: 'Cliente encontrado',
  data: {
    documentoCliente: 1015466495,
    nombre: 'Carlos',
    apellido: 'Perez',
    direccion: 'Carrera 50 #20-30',
    telefono: '3216549870',
    observaciones: 'Cliente frecuente',
    password: '',
    correo: 'carlos.perez@example.com',
  },
};

export const mockClienteBody: ClienteCreate = {
  documentoCliente: 1015466495,
  nombre: 'Carlos',
  apellido: 'Perez',
  direccion: 'Carrera 50 #20-30',
  telefono: '3216549870',
  observaciones: 'Cliente frecuente',
  password: '12345',
  correo: 'carlos.perez@example.com',
};

export const mockClienteRegisterResponse: ApiResponse<Cliente> = {
  code: 201,
  message: 'Cliente registrado con éxito',
  data: {
    documentoCliente: 1015466495,
    nombre: 'Carlos',
    apellido: 'Perez',
    direccion: 'Carrera 50 #20-30',
    telefono: '3216549870',
    observaciones: 'Cliente frecuente',
    password: '',
    correo: 'carlos.perez@example.com',
  },
};

export const mockClientesResponse: ApiResponse<Cliente[]> = {
  code: 200,
  message: 'Clientes obtenidos exitosamente',
  data: [
    {
      documentoCliente: 1015466495,
      nombre: 'Carlos',
      apellido: 'Perez',
      direccion: 'Carrera 50 #20-30',
      telefono: '3216549870',
      observaciones: 'Cliente frecuente',
      password: '',
      correo: 'carlos.perez@example.com',
    },
  ],
};

export const mockClienteUpdateResponse: ApiResponse<Cliente> = {
  code: 200,
  message: 'Cliente actualizado',
  data: {
    documentoCliente: 1015466495,
    nombre: 'Carlos',
    apellido: 'Perez',
    direccion: 'Carrera 50 #20-30',
    telefono: '3001112233',
    observaciones: 'Cliente frecuente',
    password: '',
    correo: 'carlos.perez@example.com',
  },
};

export const mockClienteDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Cliente eliminado',
  data: {},
};

// Paginación y proyección
export const mockClienteListParamsPage1: ClienteListParams = { limit: 1, offset: 0 };
export const mockClienteListParamsPage2: ClienteListParams = { limit: 1, offset: 1 };
export const mockClienteFields = {
  fields: 'nombre_completo_telefono',
} as const satisfies ClienteListParams;

// El back exige el cliente completo en PUT (no hace merge)
export const mockClienteUpdateBody: ClienteUpdate = {
  nombre: 'Carlos',
  apellido: 'Perez',
  correo: 'carlos.perez@example.com',
  telefono: '3001112233',
  direccion: 'Carrera 50 #20-30',
  observaciones: 'Cliente frecuente',
};

export const mockClientesPage1: ApiResponse<Cliente[]> = {
  code: 200,
  message: 'OK',
  data: [mockClientesResponse.data[0]],
};

export const mockClientesPage2: ApiResponse<Cliente[]> = {
  code: 200,
  message: 'OK',
  data: [
    {
      documentoCliente: 1025467890,
      nombre: 'Laura',
      apellido: 'Ramirez',
      direccion: 'Avenida Siempreviva 742',
      telefono: '3131234567',
      observaciones: '',
      password: '',
      correo: 'laura.ramirez@example.com',
    },
  ],
};

export const mockClientesProjected: ApiResponse<ClienteResumen[]> = {
  code: 200,
  message: 'Clientes obtenidos',
  data: [
    { documentoCliente: 1015466495, nombre_completo: 'Carlos Perez', telefono: '3216549870' },
    { documentoCliente: 1025467890, nombre_completo: 'Laura Ramirez', telefono: '3131234567' },
  ],
};
