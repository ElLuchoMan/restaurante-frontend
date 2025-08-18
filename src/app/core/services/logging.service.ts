import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  log(message: any, ...optionalParams: any[]): void {
    console.info(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams);
  }
}

