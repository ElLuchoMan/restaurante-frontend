import { ControlNomina } from '../../core/services/control-nomina.service';
import { ApiResponse } from '../models/api-response.model';

export const mockControlNominaList: ApiResponse<ControlNomina[]> = {
  code: 200,
  message: 'Control de nómina obtenido',
  data: [
    { controlNominaId: 1, fecha: '2024-12-30', estado: 'GENERADA' },
    { controlNominaId: 2, fecha: '2025-01-31', estado: 'GENERADA' },
    { controlNominaId: 3, fecha: '2025-02-28', estado: 'GENERADA' },
  ],
};

export const mockControlNominaById: ApiResponse<ControlNomina> = {
  code: 200,
  message: 'Registro encontrado',
  data: { controlNominaId: 1, fecha: '2024-12-30', estado: 'GENERADA' },
};
