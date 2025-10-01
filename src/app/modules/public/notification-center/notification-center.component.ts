import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

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
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss',
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  items: NotificationItem[] = [];
  private updateListener: () => void;

  constructor(private router: Router) {
    this.updateListener = () => this.loadNotifications();
  }

  ngOnInit(): void {
    this.loadNotifications();
    markAllSeen();

    // Escuchar actualizaciones del store
    window.addEventListener('notification-center:update', this.updateListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('notification-center:update', this.updateListener);
  }

  loadNotifications(): void {
    this.items = getNotifications();
  }

  open(notification: NotificationItem): void {
    const url = (notification?.data as any)?.url;
    if (typeof url === 'string' && url) {
      this.router.navigateByUrl(url);
    }
  }

  clear(): void {
    clearNotifications();
    this.loadNotifications();
  }

  getNotificationIcon(notification: NotificationItem): string {
    const tipo = (notification?.data as any)?.tipo;
    switch (tipo) {
      case 'RESERVA':
        return 'fa-calendar-check';
      case 'PEDIDO':
        return 'fa-shopping-bag';
      case 'PROMOCION':
        return 'fa-tag';
      case 'CALIFICACION':
        return 'fa-star';
      default:
        return 'fa-bell';
    }
  }

  getNotificationColor(notification: NotificationItem): string {
    const tipo = (notification?.data as any)?.tipo;
    switch (tipo) {
      case 'RESERVA':
        return 'notification-reserva';
      case 'PEDIDO':
        return 'notification-pedido';
      case 'PROMOCION':
        return 'notification-promo';
      case 'CALIFICACION':
        return 'notification-calificacion';
      default:
        return 'notification-default';
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
