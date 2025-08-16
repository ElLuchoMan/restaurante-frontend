import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    pipe = new FormatDatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format a valid Date object correctly', () => {
    const date = new Date(Date.UTC(2025, 0, 15));
    expect(pipe.transform(date)).toBe('2025-01-14');
  });

  it('should format a valid string date correctly', () => {
    expect(pipe.transform('2025-01-15T00:00:00.000Z')).toBe('2025-01-14');
  });

  it('should format an ISO date string without time correctly', () => {
    const expected = new Date(2025, 11, 24).toLocaleDateString('sv', {
      timeZone: 'America/Bogota',
    });
    expect(pipe.transform('2025-12-24')).toBe(expected);
  });

  it('should parse a Spanish date string correctly', () => {
    const expected = new Date(2025, 11, 24).toLocaleDateString('sv', {
      timeZone: 'America/Bogota',
    });
    expect(pipe.transform('24-12-2025')).toBe(expected);
  });

  it('should return the same string for a valid time in time mode', () => {
    expect(pipe.transform('12:34:56', 'time')).toBe('12:34:56');
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

  it('should format a datetime string correctly in datetime mode', () => {
    const input = '2025-01-15T12:34:56Z';
    const dateObj = new Date(input);
    const TZ = 'America/Bogota';
    const date = dateObj.toLocaleDateString('sv', { timeZone: TZ });
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
