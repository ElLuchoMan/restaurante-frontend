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
    expect(pipe.transform(date)).toBe('2025-01-15');
  });

  it('should format a valid string date correctly', () => {
    expect(pipe.transform('2025-01-15T00:00:00.000Z')).toBe('2025-01-15');
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
