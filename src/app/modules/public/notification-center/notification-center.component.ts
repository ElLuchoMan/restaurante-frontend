import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  clearNotifications,
  getNotifications,
  markAllSeen,
  NotificationItem,
} from '../../../shared/utils/notification-center.store';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-shell">
      <h2 class="section-title">Notificaciones</h2>
      <div class="card" *ngIf="items.length; else empty">
        <div *ngFor="let n of items" class="nc-item" (click)="open(n)">
          <div class="nc-title">{{ n.title }}</div>
          <div class="nc-body" *ngIf="n.body">{{ n.body }}</div>
          <div class="nc-meta">{{ n.createdAt | date: 'short' }}</div>
        </div>
      </div>
      <ng-template #empty>
        <div class="card">Aún no hay notificaciones.</div>
      </ng-template>
      <button class="btn btn-secondary" (click)="clear()">Limpiar</button>
    </div>
  `,
  styles: [
    `
      .nc-item {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        cursor: pointer;
      }
      .nc-item:hover {
        background: #fafafa;
      }
      .nc-title {
        color: #2d3748;
        font-weight: 600;
      }
      .nc-body {
        color: #4a5568;
      }
      .nc-meta {
        color: #718096;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class NotificationCenterComponent {
  items: NotificationItem[] = getNotifications();

  open(n: NotificationItem): void {
    const url = (n?.data as any)?.url;
    if (typeof url === 'string' && url) {
      window.location.href = url;
    }
  }

  clear(): void {
    clearNotifications();
    this.items = getNotifications();
  }

  ngOnInit(): void {
    try {
      markAllSeen();
    } catch {}
  }
}
