import { Component, OnInit } from '@angular/core';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private domicilioService: DomicilioService) {}

  ngOnInit(): void {
    this.buscarDomicilios();
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
        this.domicilios = response.data || [];
        this.mostrarMensaje = this.domicilios.length === 0;
      }
    });
  }

  asignarDomicilio(domicilio: Domicilio): void {
    const userId = 1035467890; // Suplantar con ID real del usuario autenticado

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
