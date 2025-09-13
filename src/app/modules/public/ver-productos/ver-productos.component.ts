import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit, TransferState, makeStateKey } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../../core/services/cart.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { ModalService } from '../../../core/services/modal.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UserService } from '../../../core/services/user.service';
import { Producto } from '../../../shared/models/producto.model';
import { ProductoFiltroPipe } from '../../../shared/pipes/producto-filtro.pipe';

@Component({
  selector: 'app-ver-productos',
  templateUrl: './ver-productos.component.html',
  styleUrls: ['./ver-productos.component.scss'],
  imports: [CommonModule, FormsModule, ProductoFiltroPipe, NgOptimizedImage],
})
export class VerProductosComponent implements OnInit, OnDestroy {
  private staticStateKey = makeStateKey<Producto[]>('ver_productos_initial');
  productos: Producto[] = [];
  mensaje: string = '';
  categorias: string[] = [];
  subcategorias: string[] = [];
  categoriaSeleccionada = '';
  subcategoriaSeleccionada = '';
  filtroNombre = '';
  filtroCategoria = '';
  filtroSubcategoria = '';
  minCalorias?: number;
  maxCalorias?: number;
  userRole: string | null = null;
  carrito: Producto[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private productoService: ProductoService,
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
    private cartService: CartService,
    private live: LiveAnnouncerService,
    private ts: TransferState,
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();

    this.userService
      .getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLogged) => {
        this.userRole = isLogged ? this.userService.getUserRole() : null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  obtenerProductos(): void {
    const cached = this.ts.get(this.staticStateKey, [] as Producto[]);
    if (cached.length) {
      this.setProductos(cached);
      return;
    }
    this.productoService
      .getProductos({ onlyActive: true, includeImage: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response.data) {
          this.setProductos(response.data);
          this.ts.set(this.staticStateKey, response.data);
        } else {
          this.mensaje = response.message;
        }
      });
  }
  private setProductos(list: Producto[]): void {
    this.productos = list;
    const categoriasSet = new Set<string>();
    const subcategoriasSet = new Set<string>();
    this.productos.forEach((p) => {
      if (p.categoria) categoriasSet.add(p.categoria);
      if (p.subcategoria) subcategoriasSet.add(p.subcategoria);
    });
    this.categorias = Array.from(categoriasSet);
    this.subcategorias = Array.from(subcategoriasSet);
  }
  actualizarSubcategorias(): void {
    const set = new Set<string>();
    this.productos
      .filter((p) => p.categoria === this.categoriaSeleccionada)
      .forEach((p) => {
        if (p.subcategoria) set.add(p.subcategoria);
      });
    this.subcategorias = Array.from(set);
    this.subcategoriaSeleccionada = '';
  }
  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.categoriaSeleccionada = '';
    this.subcategoriaSeleccionada = '';
    this.minCalorias = undefined;
    this.maxCalorias = undefined;
    this.actualizarSubcategorias();
  }

  //Paginación
  paginaActual = 1;
  productosPorPagina = 8;

  get productosFiltrados(): Producto[] {
    return this.productos.filter((p) => {
      const nombreMatch = p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const categoriaMatch =
        !this.categoriaSeleccionada || p.categoria === this.categoriaSeleccionada;
      const subcategoriaMatch =
        !this.subcategoriaSeleccionada || p.subcategoria === this.subcategoriaSeleccionada;
      const caloriasMatch =
        (this.minCalorias == null ||
          (p.calorias !== undefined && p.calorias >= this.minCalorias)) &&
        (this.maxCalorias == null || (p.calorias !== undefined && p.calorias <= this.maxCalorias));

      return nombreMatch && categoriaMatch && subcategoriaMatch && caloriasMatch;
    });
  }

  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.productosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
  }

  abrirDetalle(producto: Producto): void {
    const botones = [];

    if (this.userRole === 'Cliente') {
      botones.push({
        label: '🛒 Agregar al carrito',
        class: 'btn btn-primary',
        action: () => {
          this.cartService.addToCart(producto);
          this.live.announce(`${producto.nombre} añadido al carrito`);
          this.modalService.closeModal();
        },
      });
    }

    if (this.userRole === 'Administrador') {
      botones.push({
        label: '✏️ Editar',
        class: 'btn btn-warning',
        action: () => {
          this.router.navigate(['/admin/productos/editar', producto.productoId]);
          this.modalService.closeModal();
        },
      });
    }

    this.modalService.openModal({
      title: producto.nombre,
      image:
        typeof (producto as any).imagen === 'string'
          ? (producto as any).imagen
          : '../../../../assets/img/logo2.webp',
      details: {
        precio: producto.precio,
        calorias: producto.calorias,
        categoria: producto.categoria,
        subcategoria: producto.subcategoria,
        descripcion: producto.descripcion,
      },
      buttons: botones,
    });
  }

  trackByProductoId(index: number, item: Producto) {
    return item.productoId;
  }
}
