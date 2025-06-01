import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { UserService } from '../../../core/services/user.service';
import { Pedido } from '../../../shared/models/pedido.model';
import { RouterModule } from '@angular/router';
import { FormatDatePipe } from "../../../shared/pipes/format-date.pipe";

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.scss'],
  imports: [CommonModule, RouterModule, FormatDatePipe]
})
export class MisPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  error = '';

  constructor(
    private pedidoService: PedidoService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.userService.getUserId();
    this.pedidoService.getMisPedidos(userId).subscribe({
      next: res => {
        this.pedidos = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus pedidos';
        this.loading = false;
      }
    });
  }
}
