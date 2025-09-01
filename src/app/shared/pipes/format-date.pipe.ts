import { Pipe, PipeTransform } from '@angular/core';

type Mode = 'date' | 'time' | 'datetime';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date | string | null, mode: Mode = 'date'): string {
    if (!value) return '';

    let dateObj: Date;

    // 1) Si ya es Date lo usamos tal cual
    if (value instanceof Date) {
      dateObj = value;
    } else {
      const s = value.trim();
      let m: RegExpMatchArray | null;

      // 2) Modo fecha puro: detectar YYYY-MM-DD o DD-MM-YYYY
      if (mode === 'date') {
        if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
          // ISO date
          const [, yy, mm, dd] = m;
          dateObj = new Date(+yy, +mm - 1, +dd);
        } else if ((m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/))) {
          // Español
          const [, dd, mm, yy] = m;
          dateObj = new Date(+yy, +mm - 1, +dd);
        } else {
          dateObj = new Date(s);
        }
      }
      // 3) Modo hora puro: si es HH:mm:ss lo devolvemos tal cual
      else if (mode === 'time') {
        if (/^\d{2}:\d{2}:\d{2}$/.test(s)) {
          return s;
        } else {
          dateObj = new Date(s);
        }
      }
      // 4) Modo datetime: intento parse ISO completo
      else {
        dateObj = new Date(s);
      }
    }

    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', value);
      return '';
    }

    const TZ = 'America/Bogota';
    switch (mode) {
      case 'time':
        return dateObj.toLocaleTimeString('es-CO', {
          timeZone: TZ,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      case 'datetime':
        const d = dateObj.toLocaleDateString('sv', { timeZone: TZ });
        const t = dateObj.toLocaleTimeString('es-CO', {
          timeZone: TZ,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return `${d} ${t}`;
      default: // 'date'
        return dateObj.toLocaleDateString('sv', { timeZone: TZ });
    }
  }
}
