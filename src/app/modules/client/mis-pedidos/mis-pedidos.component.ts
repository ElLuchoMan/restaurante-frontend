import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PedidoService } from '../../../core/services/pedido.service';
import { UserService } from '../../../core/services/user.service';
import { Pedido } from '../../../shared/models/pedido.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

type DetallesAPI = {
  pedidoId?: number;
  fechaPedido?: string;
  horaPedido?: string;
  delivery?: boolean;
  estadoPedido?: string;
  metodoPago?: string;
  productos?: string; // viene como string JSON
};

type PedidoCard = Pedido & {
  total?: number;
  items?: number;
  estadoPago?: string;
  metodoPago?: string;
  direccion?: string;
  telefono?: string;
  productos?: any[];
};

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.scss'],
  imports: [CommonModule, RouterModule, FormatDatePipe]
})
export class MisPedidosComponent implements OnInit, OnDestroy {
  pedidos: PedidoCard[] = [];
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private pedidoService: PedidoService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const userId = this.userService.getUserId();

    this.pedidoService.getMisPedidos(userId).pipe(
      // 1) ordena por fecha (DD-MM-YYYY) + hora (0000-01-01 HH:mm:ss …)
      map(res => {
        console.log('Pedidos', res);
        const base: Pedido[] = res?.data || [];
        return [...base].sort((a, b) => {
          const da = this.toComparableDate(a.fechaPedido, a.horaPedido);
          const db = this.toComparableDate(b.fechaPedido, b.horaPedido);
          return db.getTime() - da.getTime();
        });
      }),
      // 2) enriquece cada pedido con /pedidos/detalles (si falla, simplemente deja los campos como undefined)
      switchMap(sorted =>
        forkJoin(
          sorted.map(p =>
            p.pedidoId !== undefined
              ? this.pedidoService.getPedidoDetalles(p.pedidoId).pipe(
                map(resp => this.mergeDetalles(p, resp?.data as DetallesAPI)),
                catchError(() => of(p as PedidoCard))
              )
              : of(p as PedidoCard)
          )
        )
      ),
      catchError(() => {
        this.error = 'No se pudieron cargar tus pedidos';
        return of([] as PedidoCard[]);
      }),
      takeUntil(this.destroy$)
    )
      .subscribe(peds => {
        this.pedidos = peds;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mergeDetalles(p: Pedido, det?: DetallesAPI): PedidoCard {
    if (!det) return { ...p };

    const metodoPago = det.metodoPago ?? (det as any).METODO_PAGO;
    const productosStr = det.productos ?? (det as any).PRODUCTOS;

    let productos: any[] | undefined;
    try {
      const parsed = productosStr ? JSON.parse(productosStr) : [];
      productos = Array.isArray(parsed) ? parsed : [];
    } catch {
      productos = undefined;
    }

    const total = productos?.reduce((acc, it) => {
      const sub = Number(it.SUBTOTAL ?? it.subtotal);
      if (!isNaN(sub)) return acc + sub;
      const u = Number(it.PRECIO_UNITARIO ?? it.precio ?? 0);
      const q = Number(it.CANTIDAD ?? it.cantidad ?? 1);
      return acc + (isNaN(u) || isNaN(q) ? 0 : u * q);
    }, 0);

    const items = productos?.length ?? undefined;

    return {
      ...p,
      metodoPago: metodoPago || undefined,
      productos,
      total: total !== undefined ? total : undefined,
      items
    };
  }

  // fecha: 'DD-MM-YYYY'; hora: '0000-01-01 HH:mm:ss +0000 UTC'
  private toComparableDate(fecha?: string, hora?: string): Date {
    const { y, m, d } = this.parseFechaDDMMYYYY(fecha);
    const { hh, mm, ss } = this.parseHora(hora);
    // Usamos UTC para evitar desfases con el sufijo " +0000 UTC" del backend
    return new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
  }

  private parseFechaDDMMYYYY(fecha?: string): { d: number; m: number; y: number } {
    const f = (fecha || '').trim();
    const m = f.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) return { d: +m[1], m: +m[2], y: +m[3] };
    return { d: 1, m: 1, y: 1970 };
  }

  private parseHora(hora?: string): { hh: number; mm: number; ss: number } {
    const h = (hora || '').trim();
    const m = h.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (m) return { hh: +m[1], mm: +m[2], ss: +m[3] };
    return { hh: 0, mm: 0, ss: 0 };
  }
}
