import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { estadoPago, metodoPago } from '../../../../shared/constants';
import { ModalService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { PagoService } from '../../../../core/services/pago.service';
import { UserService } from '../../../../core/services/user.service';
import { fechaDDMMYYYY_Bogota, horaHHMMSS_Bogota, fechaHoraDDMMYYYY_HHMMSS_Bogota } from '../../../../shared/utils/dateHelper';

@Component({
  selector: 'app-ruta-domicilio',
  standalone: true,
  templateUrl: './ruta-domicilio.component.html',
  styleUrls: ['./ruta-domicilio.component.scss'],
  imports: [CommonModule]
})
export class RutaDomicilioComponent implements OnInit {
  ubicacionUrl: SafeResourceUrl | undefined;
  direccionCliente: string = '';
  telefonoCliente: string = '';
  observaciones: string = '';
  googleMapsUrl: string = '';
  domicilioId: number = 0;
  nombreCliente: string = '';

  public restauranteDireccion = 'Calle 78a # 62 - 48, Bogotá, Colombia';

  constructor(
    public route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    public clienteService: ClienteService,
    public domicilioService: DomicilioService,
    public userService: UserService,
    public pagoService: PagoService,
    public router: Router,
    public modalService: ModalService,
    public toastrService: ToastrService,
    private logger: LoggingService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.domicilioId = params['id'] ? +params['id'] : 0;
      this.domicilioService.getDomicilioById(this.domicilioId).subscribe(response => {
        if (response) {
          console.log('Domicilio obtenido:', response);
          this.nombreCliente = response.data.cliente.nombre;
        }
      });
      this.direccionCliente = params['direccion'] || 'Calle 100 # 13 - 55, Bogotá, Colombia';
      this.telefonoCliente = params['telefono'] || 'No disponible';
      this.observaciones = params['observaciones'] || 'Sin observaciones';
      this.nombreCliente = params['nombre'] || 'Cliente';


      if (this.direccionCliente) {
        this.generarRuta();
        this.generarUrlGoogleMaps();
      }
    });
  }

  public generarRuta(): void {
    const apiKey = environment.googleMapsApiKey;
    const origen = encodeURIComponent(this.restauranteDireccion);
    const destino = encodeURIComponent(this.direccionCliente);
    const url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origen}&destination=${destino}&mode=driving&avoid=tolls|highways`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public generarUrlGoogleMaps(): void {
    const origen = encodeURIComponent(this.restauranteDireccion);
    const destino = encodeURIComponent(this.direccionCliente);
    this.googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}`;
  }

  marcarFinalizado(): void {
    if (this.domicilioId) {
      this.domicilioService.updateDomicilio(this.domicilioId, { entregado: true })
        .subscribe(
          response => {
            this.toastrService.success('Domicilio marcado como finalizado');
            this.logger.log(LogLevel.INFO, 'Domicilio marcado como finalizado', response);
          },
          error => {
            console.error('Error al marcar finalizado', error);
          }
        );
    } else {
      console.error('No se encontró el ID del domicilio.');
    }
  }

  marcarPago(): void {
    if (this.domicilioId) {
      this.modalService.openModal({
        title: 'Seleccionar Método de Pago',
        select: {
          label: 'Seleccione el método de pago',
          options: [
            { label: 'Nequi', value: 'NEQUI' },
            { label: 'Daviplata', value: 'DAVIPLATA' },
            { label: 'Efectivo', value: 'EFECTIVO' }
          ],
          selected: null
        },
        buttons: [
          {
            label: 'Aceptar',
            class: 'btn btn-success',
            action: () => {
              const modalData = this.modalService.getModalData();
              if (modalData.select?.selected) {
                const metodoPagoSeleccionado: string = modalData.select.selected;
                this.logger.log(LogLevel.INFO, 'Método de pago seleccionado:', metodoPagoSeleccionado);
                try {
                  const pago = this.pagoService.createPago({
                    estadoPago: estadoPago.PAGADO,
                    fechaPago: fechaDDMMYYYY_Bogota(new Date()),
                    horaPago: horaHHMMSS_Bogota(new Date()),
                    metodoPagoId: this.devolverMetodoPago(metodoPagoSeleccionado),
                    monto: 10000, // TODO: Obtener el monto real
                    pagoId: 0,
                    updatedAt: fechaHoraDDMMYYYY_HHMMSS_Bogota(new Date()),
                    updatedBy: `${this.userService.getUserRole()} - ${this.userService.getUserId()}`,
                  });
                  this.logger.log(LogLevel.INFO, 'Pago creado:', pago);
                } catch (error) {
                  this.logger.log(LogLevel.ERROR, 'Error al crear pago:', error);
                }
                this.domicilioService.updateDomicilio(this.domicilioId, {
                  estadoPago: estadoPago.PAGADO
                }).subscribe(
                  response => this.toastrService.success('Domicilio marcado como pagado'),
                  error => this.toastrService.error('Error al marcar como pagado')
                );
                this.modalService.closeModal();
              } else {
                console.error("No se ha seleccionado un método de pago.");
              }
            }
          },
          {
            label: 'Cancelar',
            class: 'btn btn-danger',
            action: () => this.modalService.closeModal()
          }
        ]
      });
    } else {
      console.error('No se encontró el ID del domicilio.');
    }
  }

  devolverMetodoPago(metodoPagoSeleccionado: string): number {
    switch (metodoPagoSeleccionado) {
      case 'NEQUI':
        return metodoPago.Nequi.metodoPagoId;
      case 'DAVIPLATA':
        return metodoPago.Daviplata.metodoPagoId;
      case 'EFECTIVO':
        return metodoPago.Efectivo.metodoPagoId;
      default:
        return 0;
    }
  }

  volver(): void {
    this.router.navigate(['/trabajador/domicilios/tomar']);
  }

}

