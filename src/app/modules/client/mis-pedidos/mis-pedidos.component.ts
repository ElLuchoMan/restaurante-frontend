import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { UserService } from '../../../core/services/user.service';
import { Pedido } from '../../../shared/models/pedido.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.scss'],
  imports: [CommonModule, RouterModule, FormatDatePipe]
})
export class MisPedidosComponent implements OnInit {
  pedidos: Array<Pedido & { total?: number; items?: number }> = [];
  loading = true;
  error = '';

  constructor(
    private pedidoService: PedidoService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.userService.getUserId();

    this.pedidoService.getMisPedidos(userId).subscribe({
      next: (res) => {
        // La API devuelve en res.data un array de pedidos con:
        // { pedidoId, fechaPedido, horaPedido, estadoPedido, pagoId, domicilioId, delivery, ... }
        const base: Pedido[] = res?.data || [];

        // Mantenemos compatibilidad: si no vienen 'total' e 'items', los dejamos undefined
        // (el template ya muestra "…" como carga/valor no disponible).
        this.pedidos = base.map(p => ({
          ...p,
          // total: p.total,  // si en algún momento backend lo agrega, se mostrará
          // items: p.items   // idem
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus pedidos';
        this.loading = false;
      }
    });
  }
}
