import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PedidoService } from '../../../core/services/pedido.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatDatePipe],
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
})
export class PedidoComponent implements OnInit {
  pedido: any;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private pedidoService: PedidoService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Pedido no encontrado';
      this.loading = false;
      return;
    }

    this.pedidoService.getPedidoDetalles(id).subscribe({
      next: (res) => {
        const det = res?.data;
        console.log('Detalles del pedido', det);
        if (det) {
          let productos: any[] = [];
          try {
            const parsed = det.productos ? JSON.parse(det.productos) : [];
            productos = Array.isArray(parsed) ? parsed : [];
          } catch {
            productos = [];
          }
          const total = productos.reduce((acc, it) => {
            const sub = Number(
              it.SUBTOTAL ??
                it.subtotal ??
                Number(it.PRECIO_UNITARIO ?? it.precio ?? 0) *
                  Number(it.CANTIDAD ?? it.cantidad ?? 1),
            );
            return acc + (isNaN(sub) ? 0 : sub);
          }, 0);
          this.pedido = { ...det, productos: productos, total };
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el pedido';
        this.loading = false;
      },
    });
  }
}
