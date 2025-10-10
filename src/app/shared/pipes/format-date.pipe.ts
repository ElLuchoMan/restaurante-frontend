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
          // Crear la fecha anclada a medianoche de Bogotá para evitar desfases por TZ del entorno
          dateObj = this.createDateAtBogotaMidnight(+yy, +mm - 1, +dd);
        } else if ((m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/))) {
          // Español
          const [, dd, mm, yy] = m;
          // Crear la fecha anclada a medianoche de Bogotá para evitar desfases por TZ del entorno
          dateObj = this.createDateAtBogotaMidnight(+yy, +mm - 1, +dd);
        } else {
          dateObj = new Date(s);
        }
      }
      // 3) Modo hora puro: extraer HH:mm:ss del string o parsear como Date
      else if (mode === 'time') {
        // Si es formato "0000-01-01 HH:mm:ss +0000 UTC" (del backend), extraer directo
        if (s.match(/^0000-01-01\s+\d{2}:\d{2}:\d{2}/)) {
          const timeMatch = s.match(/(\d{2}):(\d{2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`;
          }
        }
        // Si es solo HH:mm:ss, devolver tal cual
        else if (s.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return s;
        }
        // Para otros casos (ISO, etc), parsear como Date y aplicar zona horaria
        dateObj = new Date(s);
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
        const d = this.formatDateDDMMYYYY(dateObj, TZ);
        const t = dateObj.toLocaleTimeString('es-CO', {
          timeZone: TZ,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return `${d} ${t}`;
      default: // 'date'
        return this.formatDateDDMMYYYY(dateObj, TZ);
    }
  }

  /**
   * Formatea una fecha en formato DD-MM-YYYY
   */
  private formatDateDDMMYYYY(date: Date, timeZone: string): string {
    const year = date.toLocaleDateString('en-US', { timeZone, year: 'numeric' });
    const month = date.toLocaleDateString('en-US', { timeZone, month: '2-digit' });
    const day = date.toLocaleDateString('en-US', { timeZone, day: '2-digit' });
    return `${day}-${month}-${year}`;
  }

  private createDateAtBogotaMidnight(year: number, monthIndex: number, day: number): Date {
    // Bogotá es UTC-5 sin DST. 00:00 en Bogotá corresponde a 05:00 UTC.
    return new Date(Date.UTC(year, monthIndex, day, 5, 0, 0));
  }
}
