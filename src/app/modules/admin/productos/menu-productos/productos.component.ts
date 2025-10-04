import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { UserService } from '../../../../core/services/user.service';

interface OpcionProducto {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent implements OnInit {
  mostrarMenu = true;
  esAdmin = false;

  // Subtítulo descriptivo del menú
  subtitulo = 'Administra el catálogo de productos, crea nuevos platos y gestiona el menú';

  // Opciones del menú de productos
  opciones: OpcionProducto[] = [
    {
      titulo: 'Ver Menú',
      descripcion: 'Consultar el menú',
      icono: 'fa-eye',
      ruta: '/menu',
      color: 'blue',
    },
    {
      titulo: 'Crear Producto',
      descripcion: 'Agregar un nuevo producto al menú',
      icono: 'fa-plus-circle',
      ruta: '/admin/productos/crear',
      color: 'green',
    },
    {
      titulo: 'Gestionar Categorías',
      descripcion: 'Administrar categorías del menú',
      icono: 'fa-tags',
      ruta: '/admin/productos/categorias',
      color: 'orange',
    },
  ];

  constructor(
    private router: Router,
    private userService: UserService,
  ) {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.mostrarMenu = evt.urlAfterRedirects === '/admin/productos';
      }
    });
  }

  ngOnInit(): void {
    const rol = this.userService.getUserRole();
    this.esAdmin = rol === 'Administrador';

    // Si entró directo y NO es admin, lo mandamos a crear
    if (!this.mostrarMenu && !this.esAdmin) {
      this.navegarA('/admin/productos/crear');
    }
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  volver(): void {
    this.router.navigate(['/admin/productos']);
  }
}
