import { Component, OnInit } from '@angular/core';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';

@Component({
  selector: 'app-consultar-domicilio',
  templateUrl: './consultar-domicilios.component.html',
  styleUrls: ['./consultar-domicilios.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ConsultarDomicilioComponent implements OnInit {
  domicilios: Domicilio[] = [];
  buscarPorDireccion: boolean = false;
  buscarPorTelefono: boolean = false;
  buscarPorFecha: boolean = false;
  direccion: string = '';
  telefono: string = '';
  fechaDomicilio: string = '';
  mostrarMensaje: boolean = false;
  mensaje: string = '';


  constructor(private domicilioService: DomicilioService, private userService: UserService, private trabajadorService: TrabajadorService) { }

  ngOnInit(): void {
    this.userService.getUserId();
    this.trabajadorService.searchTrabajador(this.userService.getUserId()!).subscribe(
      response => {
        console.log(response)
      }
    )
  }

  actualizarTipoBusqueda(): void {
    if (!this.buscarPorDireccion) this.direccion = '';
    if (!this.buscarPorTelefono) this.telefono = '';
    if (!this.buscarPorFecha) this.fechaDomicilio = '';
  }

  buscarDomicilios(): void {
    const params: any = {};

    if (this.buscarPorDireccion && this.direccion) {
      params.direccion = this.direccion;
    }
    if (this.buscarPorTelefono && this.telefono) {
      params.telefono = this.telefono;
    }
    if (this.buscarPorFecha && this.fechaDomicilio) {
      params.fecha = this.fechaDomicilio;
    }

    this.domicilioService.getDomicilios(params).subscribe(response => {
      if (response.code === 200) {
        this.domicilios = response.data;

        this.domicilios.forEach(domicilio => {
          if (domicilio.trabajadorAsignado) {
            this.trabajadorService.searchTrabajador(domicilio.trabajadorAsignado).subscribe(trabajador => {
              if (trabajador) {
                domicilio.trabajadorNombre = `${trabajador.data.nombre} ${trabajador.data.apellido}`;
              } else {
                domicilio.trabajadorNombre = 'No asignado';
              }
            });
          }
        });

      } else if (response.data !== null) {
        this.mostrarMensaje = true;
        this.mensaje = response.message;
      }
    });
  }


  asignarDomicilio(domicilio: Domicilio): void {
    const userId = 1035467890;

    this.domicilioService.updateDomicilio(domicilio.domicilioId!, { trabajadorAsignado: userId })
      .subscribe(response => {
        if (response.code === 200) {
          domicilio.trabajadorAsignado = userId;
        }
      });
  }

  marcarEntregado(domicilio: Domicilio): void {
    this.domicilioService.updateDomicilio(domicilio.domicilioId!, { entregado: true })
      .subscribe(response => {
        if (response.code === 200) {
          domicilio.entregado = true;
        }
      });
  }

  soloUnFiltro(): boolean {
    return [this.buscarPorDireccion, this.buscarPorTelefono, this.buscarPorFecha].filter(Boolean).length === 1;
  }

  dosFiltros(): boolean {
    return [this.buscarPorDireccion, this.buscarPorTelefono, this.buscarPorFecha].filter(Boolean).length === 2;
  }

  tresFiltros(): boolean {
    return [this.buscarPorDireccion, this.buscarPorTelefono, this.buscarPorFecha].filter(Boolean).length === 3;
  }

}
