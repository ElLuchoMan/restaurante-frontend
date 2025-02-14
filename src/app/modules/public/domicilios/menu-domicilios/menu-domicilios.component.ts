import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-menu-domicilios',
  templateUrl: './menu-domicilios.component.html',
  styleUrls: ['./menu-domicilios.component.scss'],
  imports: [RouterOutlet, CommonModule]
})
export class MenuDomiciliosComponent implements OnInit {
  mostrarMenu: boolean = true;
  rol: string | null = '';
  esDomiciliario: boolean = false;

  constructor(private router: Router, private userService: UserService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mostrarMenu = event.urlAfterRedirects === '/domicilios';
      }
    });
  }

  ngOnInit(): void {
    this.rol = this.userService.getUserRole() || null;
    this.esDomiciliario = this.rol === 'Domiciliario';

    !this.esDomiciliario ? null : this.irA('tomar');
  }

  irA(ruta: string): void {
    this.router.navigate([`/domicilios/${ruta}`]);
  }

  volver(): void {
    this.router.navigate(['/domicilios']);
  }
}
