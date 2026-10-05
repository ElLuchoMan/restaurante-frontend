import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { ModalService } from '../../../../core/services/modal.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoDomicilio } from '../../../../shared/constants';
import { Domicilio } from '../../../../shared/models/domicilio.model';

@Component({
  selector: 'app-consultar-domicilio',
  templateUrl: './consultar-domicilios.component.html',
  styleUrls: ['./consultar-domicilios.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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

    this.mostrarMensaje = false;
    this.domicilioService.getDomicilios(params).subscribe({
      next: (response) => {
        this.domicilios = response.data;
        if (this.domicilios.length === 0) {
          this.mostrarMensaje = true;
          this.mensaje = 'No se encontraron domicilios';
        }

        this.domicilios.forEach((domicilio) => {
          if (domicilio.trabajadorAsignado) {
            this.trabajadorService
              .searchTrabajador(domicilio.trabajadorAsignado.documentoTrabajador)
              .subscribe({
                next: (trabajador) => {
                  domicilio.trabajadorNombre = trabajador?.data
                    ? `${trabajador.data.nombre} ${trabajador.data.apellido}`
                    : 'No asignado';
                },
                // /trabajadores/search es solo de Administrador: un Domiciliario recibe 403
                error: () => {
                  domicilio.trabajadorNombre = 'No asignado';
                },
              });
          }
        });
      },
      error: (err) => {
        this.domicilios = [];
        this.mostrarMensaje = true;
        this.mensaje = err?.message || 'No se pudieron consultar los domicilios';
      },
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
              if (modalData.select?.selected != null) {
                this.confirmarAsignacion(domicilio, Number(modalData.select.selected));
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
    this.domicilioService.asignarDomiciliario(domicilio.domicilioId!, trabajadorId).subscribe({
      next: (response) => {
        // `data` es el domicilio completo actualizado (EN_CAMINO y con su trabajador).
        Object.assign(domicilio, response.data);

        this.trabajadorService.searchTrabajador(trabajadorId).subscribe({
          next: (trabajador) => {
            domicilio.trabajadorNombre = trabajador.data
              ? `${trabajador.data.nombre} ${trabajador.data.apellido}`
              : 'No asignado';
          },
          error: () => {
            domicilio.trabajadorNombre = 'No asignado';
          },
        });
      },
      // 404 (domicilio o trabajador inexistente) o 409 (ya asignado)
      error: (err) => {
        this.mostrarMensaje = true;
        this.mensaje = err?.message || 'No se pudo asignar el domicilio';
      },
    });
  }

  countFiltros(): number {
    return [this.buscarPorDireccion, this.buscarPorTelefono, this.buscarPorFecha].filter(Boolean)
      .length;
  }
  marcarEntregado(domicilio: Domicilio): void {
    this.domicilioService
      .updateDomicilio(domicilio.domicilioId!, {
        estado: estadoDomicilio.ENTREGADO,
        updatedBy: `Usuario ${this.userService.getUserId()}`,
      })
      .subscribe({
        // `data` es el domicilio completo con `entregado` calculado por el back.
        next: (response) => Object.assign(domicilio, response.data),
        error: (err) => {
          this.mostrarMensaje = true;
          this.mensaje = err?.message || 'No se pudo marcar el domicilio como entregado';
        },
      });
  }
}
