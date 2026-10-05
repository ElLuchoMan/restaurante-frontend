import { FkRef } from './descuento-types.model';

export interface Subcategoria {
  subcategoriaId?: number;
  nombre: string;
  /**
   * El back serializa la FK (`*models.Categoria`) como objeto `{ categoriaId, nombre }` en las
   * respuestas; en el body de POST/PUT se envía el número (ver `SubcategoriaCreate`).
   */
  categoriaId?: number | FkRef<'categoriaId'>;
}
