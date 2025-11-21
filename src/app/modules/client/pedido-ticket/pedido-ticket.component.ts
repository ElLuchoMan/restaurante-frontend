import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-pedido-ticket',
  standalone: true,
  imports: [CommonModule, FormatDatePipe],
  templateUrl: './pedido-ticket.component.html',
  styleUrls: ['./pedido-ticket.component.scss'],
})
export class PedidoTicketComponent {
  @Input() pedido: any;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getEstadoClass(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'TERMINADO':
      case 'ENTREGADO':
        return 'success';
      case 'INICIADO':
      case 'EN_PREPARACION':
      case 'PREPARACION':
        return 'warning';
      case 'CANCELADO':
        return 'danger';
      case 'EN_CAMINO':
        return 'info';
      default:
        return 'default';
    }
  }

  getEstadoIcon(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'TERMINADO':
      case 'ENTREGADO':
        return 'fa-check-circle';
      case 'INICIADO':
      case 'EN_PREPARACION':
      case 'PREPARACION':
        return 'fa-fire';
      case 'CANCELADO':
        return 'fa-times-circle';
      case 'EN_CAMINO':
        return 'fa-truck';
      default:
        return 'fa-info-circle';
    }
  }

  getEstadoLabel(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'TERMINADO':
        return 'Terminado';
      case 'ENTREGADO':
        return 'Entregado';
      case 'INICIADO':
        return 'Iniciado';
      case 'EN_PREPARACION':
      case 'PREPARACION':
        return 'En Preparación';
      case 'CANCELADO':
        return 'Cancelado';
      case 'EN_CAMINO':
        return 'En Camino';
      default:
        return estado;
    }
  }
}
