import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private readonly isProduction = environment.production;

  log<T>(level: LogLevel, message: T, ...optionalParams: unknown[]): void {
    if (this.isProduction && level !== LogLevel.ERROR) {
      return;
    }

    switch (level) {
      case LogLevel.INFO:
        console.info(message, ...optionalParams);
        break;
      case LogLevel.WARN:
        console.warn(message, ...optionalParams);
        break;
      case LogLevel.ERROR:
        console.error(message, ...optionalParams);
        break;
    }
  }
}
