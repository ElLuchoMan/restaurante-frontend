import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    pipe = new FormatDatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format a valid Date object correctly in DD-MM-YYYY', () => {
    const date = new Date(Date.UTC(2025, 0, 15)); // 15 enero 2025 UTC
    // En America/Bogota será 14 enero 2025 (UTC-5)
    expect(pipe.transform(date)).toBe('14-01-2025');
  });

  it('should format a valid string date correctly in DD-MM-YYYY', () => {
    const result = pipe.transform('2025-01-15T00:00:00.000Z');
    expect(result).toBe('14-01-2025'); // UTC-5
  });

  it('should format an ISO date string without time correctly in DD-MM-YYYY', () => {
    // ISO date 2025-12-24 se interpreta como fecha local
    expect(pipe.transform('2025-12-24')).toBe('24-12-2025');
  });

  it('should parse a Spanish date string correctly and format as DD-MM-YYYY', () => {
    // Entrada DD-MM-YYYY, salida DD-MM-YYYY
    expect(pipe.transform('24-12-2025')).toBe('24-12-2025');
  });

  it('should return the same string for a valid time in time mode', () => {
    expect(pipe.transform('12:34:56', 'time')).toBe('12:34:56');
  });

  it('should extract time from backend format "0000-01-01 HH:mm:ss +0000 UTC"', () => {
    expect(pipe.transform('0000-01-01 20:30:05 +0000 UTC', 'time')).toBe('20:30:05');
  });

  it('should format a datetime string correctly in time mode', () => {
    const input = '2025-01-15T12:34:56Z';
    const expected = new Date(input).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    expect(pipe.transform(input, 'time')).toBe(expected);
  });

  it('should format a datetime string correctly in datetime mode with DD-MM-YYYY', () => {
    const input = '2025-01-15T12:34:56Z';
    const dateObj = new Date(input);
    const TZ = 'America/Bogota';
    // Formato DD-MM-YYYY
    const year = dateObj.toLocaleDateString('en-US', { timeZone: TZ, year: 'numeric' });
    const month = dateObj.toLocaleDateString('en-US', { timeZone: TZ, month: '2-digit' });
    const day = dateObj.toLocaleDateString('en-US', { timeZone: TZ, day: '2-digit' });
    const date = `${day}-${month}-${year}`;
    const time = dateObj.toLocaleTimeString('es-CO', {
      timeZone: TZ,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    expect(pipe.transform(input, 'datetime')).toBe(`${date} ${time}`);
  });

  it('should return empty string for null value', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for empty string input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for an invalid date string', () => {
    expect(pipe.transform('invalid-date')).toBe('');
  });

  it('should return empty string for an invalid Date object', () => {
    expect(pipe.transform(new Date('invalid-date'))).toBe('');
  });
});
