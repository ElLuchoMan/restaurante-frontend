import { ApiResponse } from '../models/api-response.model';
import { ReservaContacto } from '../models/reserva-contacto.model';

// `documentoCliente` llega como objeto embebido (no como número).
export const mockReservaContactosByDocumentoCliente: ApiResponse<ReservaContacto[]> = {
  code: 200,
  message: 'Contactos obtenidos',
  data: [
    {
      contactoId: 1,
      nombreCompleto: 'Carlos Perez',
      telefono: '3216549870',
      documentoCliente: { documentoCliente: 1015466495 },
    },
  ],
};

export const mockReservaContactoById: ApiResponse<ReservaContacto> = {
  code: 200,
  message: 'Contacto encontrado',
  data: { contactoId: 1, nombreCompleto: 'Carlos Perez', telefono: '3216549870' },
};
