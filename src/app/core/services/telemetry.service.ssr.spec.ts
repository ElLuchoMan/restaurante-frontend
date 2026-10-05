/** @jest-environment node */
import { TelemetryService } from './telemetry.service';

describe('TelemetryService (SSR, sin window)', () => {
  it('getWindow devuelve undefined y no inicializa el tipo de dispositivo', () => {
    const service = new TelemetryService({} as any, {} as any, {} as any);
    expect(typeof window).toBe('undefined');
    expect((service as any).getWindow()).toBeUndefined();
  });
});
