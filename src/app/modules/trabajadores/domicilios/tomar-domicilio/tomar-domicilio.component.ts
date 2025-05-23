import { Component, OnInit } from '@angular/core';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tomar-domicilio',
  templateUrl: './tomar-domicilio.component.html',
  styleUrls: ['./tomar-domicilio.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class TomarDomicilioComponent implements OnInit {
  domicilios: Domicilio[] = [];
  trabajadorId: number | null = null;
  mostrarMensaje: boolean = false;
  mensaje: string = 'No se encontraron domicilios disponibles';

  constructor(
    private domicilioService: DomicilioService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.trabajadorId = this.userService.getUserId();
    this.obtenerDomiciliosDisponibles();
  }

  obtenerDomiciliosDisponibles(): void {
    if (!this.trabajadorId) return;

    const today = new Date().toISOString().split('T')[0];

    const params = { trabajador: this.trabajadorId, fecha: today };

    this.domicilioService.getDomicilios(params).subscribe(response => {
      if (response.code === 200) {
        this.domicilios = response.data.filter(domicilio =>
          !domicilio.entregado &&
          (!domicilio.trabajadorAsignado || domicilio.trabajadorAsignado === this.trabajadorId)
        );
      } else {
        this.mostrarMensaje = true;
        this.mensaje = response.message;
      }
    });
  }

  tomarDomicilio(domicilio: Domicilio): void {
    if (!this.trabajadorId) return;

    this.domicilioService.asignarDomiciliario(domicilio.domicilioId!, this.trabajadorId)
      .subscribe(response => {
        if (response.code === 200 && this.trabajadorId !== null) {
          domicilio.trabajadorAsignado = this.trabajadorId;
        }
      });
  }

  irARuta(domicilio: Domicilio): void {
    this.router.navigate(['trabajador/domicilios/ruta-domicilio'], {
      queryParams: {
        direccion: domicilio.direccion,
        telefono: domicilio.telefono,
        observaciones: domicilio.observaciones || null,
        id: domicilio.domicilioId
      }
    });
  }
}
