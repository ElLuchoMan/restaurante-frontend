export type EstadoControlNomina = 'NO GENERADA' | 'GENERADA' | 'REGENERADA';

/** Registro de control de nómina (models.ControlNomina.MarshalJSON). */
export interface ControlNomina {
  controlNominaId: number;
  fecha: string; // DD-MM-YYYY
  estado: EstadoControlNomina;
}
