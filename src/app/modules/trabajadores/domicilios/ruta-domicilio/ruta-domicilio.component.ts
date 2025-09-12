import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../../../environments/environment';
import { ClienteService } from '../../../../core/services/cliente.service';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ModalService } from '../../../../core/services/modal.service';
import { PagoService } from '../../../../core/services/pago.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoPago, metodoPago } from '../../../../shared/constants';
import { fechaYYYYMMDD_Bogota, horaHHMMSS_Bogota } from '../../../../shared/utils/dateHelper';
import {
  buildNombreCliente,
  computeTotal,
  normalizeProductos,
  obtenerMetodoPagoDefaultUtil,
  parseMetodoYObservacionesUtil,
  shouldGenerateMapsUtil,
} from './ruta-domicilio.utils';

interface ProductoDetalleVM {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoId?: number;
}

@Component({
  selector: 'app-ruta-domicilio',
  standalone: true,
  templateUrl: './ruta-domicilio.component.html',
  styleUrls: ['./ruta-domicilio.component.scss'],
  imports: [CommonModule],
})
export class RutaDomicilioComponent implements OnInit {
  ubicacionUrl: SafeResourceUrl | undefined;
  direccionCliente: string = '';
  telefonoCliente: string = '';

  /** Texto original que llega por query param (si llega concatenado) */
  observacionesRaw: string = '';

  /** Campos parseados para mostrar bonito */
  metodoPagoTexto: string = '';
  observaciones: string = '';

  googleMapsUrl: string = '';
  domicilioId: number = 0;
  nombreCliente: string = '';
  totalPedido: number = 0;
  productos: ProductoDetalleVM[] = [];
  pedidoId: number = 0;

  public restauranteDireccion = 'Calle 78a # 62 - 48, Bogotá, Colombia';

  constructor(
    public route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    public clienteService: ClienteService,
    public domicilioService: DomicilioService,
    public userService: UserService,
    public pagoService: PagoService,
    public pedidoService: PedidoService,
    public router: Router,
    public modalService: ModalService,
    public toastrService: ToastrService,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.domicilioId = params['id'] ? +params['id'] : 0;

      this.domicilioService.getDomicilioById(this.domicilioId).subscribe((response) => {
        if (!response?.data) return;

        // Nombre cliente
        this.nombreCliente = buildNombreCliente(response.data?.cliente);

        // Productos (puede venir como string JSON o como array)
        this.productos = normalizeProductos(response.data?.pedido?.productos ?? []);

        // Total
        this.totalPedido = computeTotal(response.data?.pedido?.total, this.productos);
        this.pedidoId = Number(response.data?.pedido?.pedidoId ?? 0);

        this.logger.log(LogLevel.INFO, 'Detalle domicilio', response);
      });

      const direccionParam = params['direccion'];
      this.direccionCliente = direccionParam || 'Calle 100 # 13 - 55, Bogotá, Colombia';
      this.telefonoCliente = params['telefono'] || 'No disponible';

      // Observaciones puede venir como: "Método pago: Daviplata - Observaciones: Test"
      this.observacionesRaw = params['observaciones'] || 'Sin observaciones';
      const { metodo, observaciones } = parseMetodoYObservacionesUtil(this.observacionesRaw);
      this.metodoPagoTexto = metodo;
      this.observaciones = observaciones;

      if (this.shouldGenerateMaps(direccionParam, this.direccionCliente)) {
        this.generarRuta();
        this.generarUrlGoogleMaps();
      }
    });
  }

  /**
   * Determina si se deben generar las URLs de mapas en base a los parámetros originales
   * y al valor final normalizado. No cambia el comportamiento actual: siempre retorna true
   * cuando el valor final no está vacío (incluyendo cuando se usa el valor por defecto).
   */
  private shouldGenerateMaps(direccionParam: string | undefined, direccionFinal: string): boolean {
    return shouldGenerateMapsUtil(direccionParam, direccionFinal);
  }

  /**
   * Parsea cadenas del tipo:
   *  - "Método pago: Daviplata - Observaciones: Test"
   *  - "Metodo pago: NEQUI"
   *  - "Observaciones: Entregar en portería"
   *  - o cualquier otra (devuelve todo en observaciones)
   */
  private parseMetodoYObservaciones(s: string): { metodo: string; observaciones: string } {
    return parseMetodoYObservacionesUtil(s);
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
    if (!this.domicilioId) {
      console.error('No se encontró el ID del domicilio.');
      return;
    }
    this.domicilioService.updateDomicilio(this.domicilioId, {}).subscribe({
      next: (response) => {
        this.toastrService.success('Domicilio marcado como finalizado');
        this.logger.log(LogLevel.INFO, 'Domicilio marcado como finalizado', response);
      },
      error: (err) => console.error('Error al marcar finalizado', err),
    });
  }

  marcarPago(): void {
    if (!this.domicilioId) {
      console.error('No se encontró el ID del domicilio.');
      return;
    }
    this.modalService.openModal({
      title: 'Seleccionar Método de Pago',
      select: {
        label: 'Seleccione el método de pago',
        options: [
          { label: 'Nequi', value: 'NEQUI' },
          { label: 'Daviplata', value: 'DAVIPLATA' },
          { label: 'Efectivo', value: 'EFECTIVO' },
        ],
        selected: this.obtenerMetodoPagoDefault(),
      },
      buttons: [
        {
          label: 'Aceptar',
          class: 'btn btn-success',
          action: () => {
            const modalData = this.modalService.getModalData();
            if (!modalData.select?.selected) {
              console.error('No se ha seleccionado un método de pago.');
              return;
            }
            const metodoPagoSeleccionado: string = String(modalData.select.selected);
            this.logger.log(LogLevel.INFO, 'Método de pago seleccionado:', metodoPagoSeleccionado);

            try {
              const ahora = new Date();
              this.pagoService
                .createPago({
                  estadoPago: estadoPago.PAGADO,
                  fechaPago: fechaYYYYMMDD_Bogota(ahora),
                  horaPago: horaHHMMSS_Bogota(ahora),
                  metodoPagoId: this.devolverMetodoPago(metodoPagoSeleccionado),
                  monto: this.totalPedido,
                })
                .subscribe({
                  next: (response) => {
                    const pagoId = response?.data?.pagoId;
                    this.logger.log(LogLevel.INFO, 'Pago creado:', pagoId);
                    if (pagoId) {
                      this.pedidoService.assignPago(this.pedidoId, pagoId).subscribe({
                        next: () => this.toastrService.success('Pago asignado al domicilio'),
                        error: (err) =>
                          this.logger.log(LogLevel.ERROR, 'Error al asignar pago:', err),
                      });
                    }
                  },
                  error: (err) => this.logger.log(LogLevel.ERROR, 'Error al crear pago:', err),
                });
            } catch (error) {
              this.logger.log(LogLevel.ERROR, 'Error al crear pago:', error);
            }

            this.domicilioService
              .updateDomicilio(this.domicilioId, {
                estadoPago: estadoPago.PAGADO,
              })
              .subscribe(
                () => this.toastrService.success('Domicilio marcado como pagado'),
                () => this.toastrService.error('Error al marcar como pagado'),
              );

            this.modalService.closeModal();
          },
        },
        {
          label: 'Cancelar',
          class: 'btn btn-danger',
          action: () => this.modalService.closeModal(),
        },
      ],
    });
  }

  /**
   * Intenta mapear el texto de método de pago extraído de las observaciones
   * a uno de los valores válidos del selector: 'NEQUI' | 'DAVIPLATA' | 'EFECTIVO'.
   */
  private obtenerMetodoPagoDefault(): 'NEQUI' | 'DAVIPLATA' | 'EFECTIVO' | null {
    return obtenerMetodoPagoDefaultUtil(this.metodoPagoTexto);
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
