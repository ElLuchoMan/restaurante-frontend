import { ApiResponse } from '../models/api-response.model';
import { ReservaContacto } from '../models/reserva-contacto.model';

export const mockReservaContactosByDocumentoCliente: ApiResponse<ReservaContacto[]> = {
  code: 200,
  message: 'Contactos encontrados',
  data: [
    {
      contactoId: 1,
      nombreCompleto: 'Carlos Perez',
      telefono: '3216549870',
      documentoCliente: 1015466495,
    },
  ],
};

export const mockReservaContactoById: ApiResponse<ReservaContacto> = {
  code: 200,
  message: 'Contacto encontrado',
  data: { contactoId: 1, nombreCompleto: 'Carlos Perez', telefono: '3216549870' },
};
