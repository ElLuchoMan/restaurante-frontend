import type { LogLevel as LogLevelType } from './logging.service';

describe('LoggingService', () => {
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  function loadServiceWithEnv(isProd: boolean) {
    jest.resetModules();
    jest.doMock('../../../environments/environment', () => ({
      environment: { production: isProd },
    }));
    const mod = require('./logging.service') as typeof import('./logging.service');
    const svc = new mod.LoggingService();
    return { service: svc, LogLevel: mod.LogLevel as typeof mod.LogLevel as LogLevelType };
  }

  it('debe registrar info/warn/error en modo desarrollo', () => {
    const { service, LogLevel } = loadServiceWithEnv(false);
    service.log(LogLevel.INFO, 'mensaje-info', { a: 1 });
    service.log(LogLevel.WARN, 'mensaje-warn');
    service.log(LogLevel.ERROR, 'mensaje-error', 123);

    expect(infoSpy).toHaveBeenCalledWith('mensaje-info', { a: 1 });
    expect(warnSpy).toHaveBeenCalledWith('mensaje-warn');
    expect(errorSpy).toHaveBeenCalledWith('mensaje-error', 123);
  });

  it('en producción solo debe registrar errores', () => {
    const { service, LogLevel } = loadServiceWithEnv(true);
    service.log(LogLevel.INFO, 'no-debe-verse');
    service.log(LogLevel.WARN, 'no-debe-verse');
    service.log(LogLevel.ERROR, 'si-debe-verse');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('si-debe-verse');
  });
});
