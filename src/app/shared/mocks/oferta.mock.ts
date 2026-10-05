import { ApiResponse } from '../models/api-response.model';
import { Oferta, OfertaActiva } from '../models/oferta.model';

export const mockOfertaMartes: ApiResponse<Oferta> = {
  code: 200,
  message: 'Oferta obtenida exitosamente',
  data: {
    ofertaId: 1,
    titulo: 'Martes de Gaseosas',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 30,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    diasSemana: ['Martes'],
    horaInicio: null,
    horaFin: null,
    activo: true,
    restauranteId: 1,
  },
};

export const mockOfertasActivas: ApiResponse<OfertaActiva[]> = {
  code: 200,
  message: 'Ofertas activas obtenidas exitosamente',
  data: [
    {
      ofertaId: 1,
      titulo: 'Martes de Gaseosas',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 30,
      productosIds: [1, 2],
    },
  ],
};
