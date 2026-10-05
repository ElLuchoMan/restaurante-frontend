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
    // JSON real del back: fechas `DD-MM-YYYY`, horas ausentes si no hay horario y la FK de
    // restaurante serializada como objeto.
    fechaInicio: '01-01-2025',
    fechaFin: '31-12-2025',
    diasSemana: ['Martes'],
    activo: true,
    restauranteId: { restauranteId: 1 },
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
