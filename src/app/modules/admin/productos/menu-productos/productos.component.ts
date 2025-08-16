import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  mostrarMenu = true;
  esAdmin = false;
  constructor(private router: Router, private userService: UserService) {
    this.router.events.subscribe(evt => {
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
      this.irA('crear');
    }
  }
  irA(op: 'ver' | 'crear') {
    if (op === 'ver') {
      // Va al menú público
      this.router.navigate(['/menu']);
    } else {
      // Carga dentro del router-outlet hijo
      this.router.navigate(['/admin', 'productos', 'crear']);
    }
  }

  volver() {
    this.router.navigate(['/admin/productos']);
  }
}
