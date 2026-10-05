import { ApiResponse } from '../models/api-response.model';
import { ControlNomina } from '../models/control-nomina.model';

export const mockControlNominaList: ApiResponse<ControlNomina[]> = {
  code: 200,
  message: 'Control de nómina obtenido',
  data: [
    { controlNominaId: 1, fecha: '30-12-2024', estado: 'GENERADA' },
    { controlNominaId: 2, fecha: '31-01-2025', estado: 'GENERADA' },
    { controlNominaId: 3, fecha: '28-02-2025', estado: 'GENERADA' },
  ],
};

export const mockControlNominaById: ApiResponse<ControlNomina> = {
  code: 200,
  message: 'Registro encontrado',
  data: { controlNominaId: 1, fecha: '30-12-2024', estado: 'GENERADA' },
};
