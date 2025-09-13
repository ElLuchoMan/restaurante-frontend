import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private isBrowser: boolean;
  private online$ = new BehaviorSubject<boolean>(true);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const initial =
        typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : true;
      this.online$.next(initial);
      window.addEventListener('online', () => this.online$.next(true));
      window.addEventListener('offline', () => this.online$.next(false));
    }
  }

  get isOnline$() {
    return this.online$.asObservable();
  }

  get current(): boolean {
    return this.online$.value;
  }
}
