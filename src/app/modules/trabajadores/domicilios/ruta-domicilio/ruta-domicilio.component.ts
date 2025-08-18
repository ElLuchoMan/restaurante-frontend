import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { estadoPago } from '../../../../shared/constants';
import { ModalService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { SafePipe } from "../../../../shared/pipes/safe.pipe";

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

  public restauranteDireccion = 'Calle 78a # 62 - 48, Bogotá, Colombia';

  constructor(
    public route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    public domicilioService: DomicilioService,
    public router: Router,
    public modalService: ModalService,
    public toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.direccionCliente = params['direccion'] || 'Calle 100 # 13 - 55, Bogotá, Colombia';
      this.telefonoCliente = params['telefono'] || 'No disponible';
      this.observaciones = params['observaciones'] || 'Sin observaciones';
      this.domicilioId = params['id'] ? +params['id'] : 0;

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
            console.log('Domicilio marcado como finalizado', response);
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
        selects: [
          {
            label: 'Seleccione el método de pago',
            options: [
              { label: 'Nequi', value: 'NEQUI' },
              { label: 'Daviplata', value: 'DAVIPLATA' },
              { label: 'Efectivo', value: 'EFECTIVO' }
            ],
            selected: null
          }
        ],
        buttons: [
          {
            label: 'Aceptar',
            class: 'btn btn-success',
            action: () => {
              const modalData = this.modalService.getModalData();
              const selected = modalData?.selects?.[0].selected;
              if (selected) {
                const metodoPagoSeleccionado = selected;
                console.log('Método de pago seleccionado:', metodoPagoSeleccionado);
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


  volver(): void {
    this.router.navigate(['/trabajador/domicilios/tomar']);
  }

}
