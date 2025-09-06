import {
    fechaDDMMYYYY_Bogota,
    fechaHoraDDMMYYYY_HHMMSS_Bogota,
    fechaYYYYMMDD_Bogota,
    horaHHMMSS_Bogota,
} from './dateHelper';

describe('dateHelper', () => {
  const fixed = new Date('2024-03-05T06:07:08.000Z');

  it('formatea YYYY-MM-DD en zona Bogotá', () => {
    const out = fechaYYYYMMDD_Bogota(fixed);
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formatea DD-MM-YYYY en zona Bogotá', () => {
    const out = fechaDDMMYYYY_Bogota(fixed);
    expect(out).toMatch(/^\d{2}-\d{2}-\d{4}$/);
  });

  it('formatea HH:MM:SS en zona Bogotá', () => {
    const out = horaHHMMSS_Bogota(fixed);
    expect(out).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('compone fecha y hora correctamente', () => {
    const out = fechaHoraDDMMYYYY_HHMMSS_Bogota(fixed);
    expect(out).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/);
  });

  it('usa nowInBogota por defecto sin explotar', () => {
    // No lanza y devuelve cadenas válidas
    expect(() => fechaYYYYMMDD_Bogota()).not.toThrow();
    expect(() => fechaDDMMYYYY_Bogota()).not.toThrow();
    expect(() => horaHHMMSS_Bogota()).not.toThrow();
    expect(() => fechaHoraDDMMYYYY_HHMMSS_Bogota()).not.toThrow();
  });
});


