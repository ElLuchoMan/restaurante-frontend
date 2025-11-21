import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private headerVisible = new BehaviorSubject<boolean>(true);
  headerVisible$ = this.headerVisible.asObservable();

  constructor() {}

  hideHeader(): void {
    this.headerVisible.next(false);
  }

  showHeader(): void {
    this.headerVisible.next(true);
  }
}
