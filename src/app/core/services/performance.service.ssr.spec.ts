/** @jest-environment node */
import { Subject } from 'rxjs';

import { PerformanceService } from './performance.service';

describe('PerformanceService (SSR, sin window)', () => {
  it('handlePerformanceEntry ignora entradas cuando window no existe', () => {
    const router: any = { events: new Subject() };
    const service = new PerformanceService(router);
    const record = jest.spyOn(service as any, 'recordMetrics');

    expect(typeof window).toBe('undefined');
    (service as any).handlePerformanceEntry({ entryType: 'paint', name: 'x', startTime: 1 });

    expect(record).not.toHaveBeenCalled();
  });
});
