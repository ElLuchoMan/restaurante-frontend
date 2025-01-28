import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true, // Standalone para Angular moderno
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) {
      return ''; // Maneja valores nulos o vacíos
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    // Asegura que sea una fecha válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', value);
      return '';
    }

    // Usar UTC para evitar ajustes de zona horaria
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
