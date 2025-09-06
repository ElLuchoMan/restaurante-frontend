// Algunas instalaciones del entorno pueden no incluir
// '@testing-library/jest-dom'. Se intenta importar de forma
// tolerante para evitar fallos en los tests si no está disponible.
try {
  require('@testing-library/jest-dom');
} catch {
  // no-op: los matchers adicionales no estarán disponibles
}

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
