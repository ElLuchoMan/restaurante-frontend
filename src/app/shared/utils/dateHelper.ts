const TZ = 'America/Bogota';
const pad = (n: number) => String(n).padStart(2, '0');

function nowInBogota(): Date {
  return new Date();
}

export function fechaYYYYMMDD_Bogota(d = nowInBogota()): string {
  const parts = new Intl.DateTimeFormat('es-CO', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(d)
    .reduce((acc, p) => ((acc[p.type as keyof typeof acc] = p.value), acc), {
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: '',
      second: '',
    } as Record<string, string>);
  return `${parts['year']}-${parts['month']}-${parts['day']}`;
}

export function fechaDDMMYYYY_Bogota(d = nowInBogota()): string {
  const parts = new Intl.DateTimeFormat('es-CO', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(d)
    .reduce((acc, p) => ((acc[p.type as keyof typeof acc] = p.value), acc), {
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: '',
      second: '',
    } as Record<string, string>);
  return `${parts['day']}-${parts['month']}-${parts['year']}`;
}

export function horaHHMMSS_Bogota(d = nowInBogota()): string {
  const parts = new Intl.DateTimeFormat('es-CO', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(d)
    .reduce((acc, p) => ((acc[p.type as keyof typeof acc] = p.value), acc), {
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: '',
      second: '',
    } as Record<string, string>);
  return `${parts['hour']}:${parts['minute']}:${parts['second']}`;
}

export function fechaHoraDDMMYYYY_HHMMSS_Bogota(d = nowInBogota()): string {
  return `${fechaDDMMYYYY_Bogota(d)} ${horaHHMMSS_Bogota(d)}`;
}
