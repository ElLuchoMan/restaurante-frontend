import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { ModalService } from '../../../../core/services/modal.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { UserService } from '../../../../core/services/user.service';
import { Domicilio } from '../../../../shared/models/domicilio.model';

@Component({
  selector: 'app-consultar-domicilio',
  templateUrl: './consultar-domicilios.component.html',
  styleUrls: ['./consultar-domicilios.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ConsultarDomicilioComponent implements OnInit {
  domicilios: Domicilio[] = [];
  trabajadores: any[] = [];
  buscarPorDireccion: boolean = false;
  buscarPorTelefono: boolean = false;
  buscarPorFecha: boolean = false;
  direccion: string = '';
  telefono: string = '';
  fechaDomicilio: string = '';
  mostrarMensaje: boolean = false;
  mensaje: string = '';

  constructor(
    private domicilioService: DomicilioService,
    private userService: UserService,
    private trabajadorService: TrabajadorService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.userService.getUserId();
  }

  actualizarTipoBusqueda(): void {
    if (!this.buscarPorDireccion) this.direccion = '';
    if (!this.buscarPorTelefono) this.telefono = '';
    if (!this.buscarPorFecha) this.fechaDomicilio = '';
  }

  buscarDomicilios(): void {
    const params: any = {};

    if (this.buscarPorDireccion && this.direccion) params.direccion = this.direccion;
    if (this.buscarPorTelefono && this.telefono) params.telefono = this.telefono;
    if (this.buscarPorFecha && this.fechaDomicilio) params.fecha = this.fechaDomicilio;

    this.domicilioService.getDomicilios(params).subscribe((response) => {
      if (response.code === 200) {
        this.domicilios = response.data;

        this.domicilios.forEach((domicilio) => {
          if (domicilio.trabajadorAsignado) {
            this.trabajadorService
              .searchTrabajador(domicilio.trabajadorAsignado)
              .subscribe((trabajador) => {
                domicilio.trabajadorNombre = trabajador
                  ? `${trabajador.data.nombre} ${trabajador.data.apellido}`
                  : 'No asignado';
              });
          }
        });
      } else {
        this.mostrarMensaje = true;
        this.mensaje = response.message;
      }
    });
  }

  asignarDomicilio(domicilio: Domicilio): void {
    this.trabajadorService.getTrabajadores().subscribe((trabajadores) => {
      const trabajadoresOptions = trabajadores.map((t) => ({
        label: `${t.nombre} ${t.apellido}`,
        value: t.documentoTrabajador,
      }));

      this.modalService.openModal({
        title: 'Asignar Trabajador',
        select: {
          label: 'Seleccione un trabajador',
          options: trabajadoresOptions,
          selected: null,
        },
        buttons: [
          {
            label: 'Aceptar',
            class: 'btn btn-success',
            action: () => {
              const modalData = this.modalService.getModalData();
              if (modalData.select?.selected) {
                this.confirmarAsignacion(domicilio, modalData.select.selected);
                this.modalService.closeModal();
              }
            },
          },
          {
            label: 'Cancelar',
            class: 'btn btn-danger',
            action: () => this.modalService.closeModal(),
          },
        ],
      });
    });
  }

  confirmarAsignacion(domicilio: Domicilio, trabajadorId: number): void {
    this.domicilioService
      .asignarDomiciliario(domicilio.domicilioId!, trabajadorId)
      .subscribe((response) => {
        if (response.code === 200) {
          domicilio.trabajadorAsignado = trabajadorId;

          this.trabajadorService.searchTrabajador(trabajadorId).subscribe((trabajador) => {
            domicilio.trabajadorNombre = `${trabajador.data.nombre} ${trabajador.data.apellido}`;
          });
        }
      });
  }

  countFiltros(): number {
    return [this.buscarPorDireccion, this.buscarPorTelefono, this.buscarPorFecha].filter(Boolean)
      .length;
  }
  marcarEntregado(domicilio: Domicilio): void {
    this.domicilioService.updateDomicilio(domicilio.domicilioId!, {}).subscribe((response) => {
      if (response.code === 200) {
        domicilio.entregado = true;
      }
    });
  }
}
