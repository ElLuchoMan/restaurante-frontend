import { DiaSemana } from '../constants';

export interface Restaurante {
  restauranteId?: number;
  nombreRestaurante: string;
  horaApertura: string;
  diasLaborales: DiaSemana[];
}
