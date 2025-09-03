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
import {
  fechaHoraDDMMYYYY_HHMMSS_Bogota,
  fechaYYYYMMDD_Bogota,
  horaHHMMSS_Bogota
} from '../../../../shared/utils/dateHelper';

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
        const cli = response.data?.cliente;
        this.nombreCliente = cli ? `${cli.nombre ?? ''} ${cli.apellido ?? ''}`.trim() : '';

        // Productos (puede venir como string JSON o como array)
        const raw = response.data?.pedido?.productos ?? [];
        const arr: any[] = typeof raw === 'string' ? JSON.parse(raw) : raw;

        // Normalizamos a VM con tipos correctos
        this.productos = (arr ?? []).map((x: any) => ({
          nombre: String(x.NOMBRE ?? x.nombre ?? ''),
          cantidad: Number(x.CANTIDAD ?? x.cantidad ?? 0),
          precioUnitario: Number(x.PRECIO_UNITARIO ?? x.precioUnitario ?? x.PRECIO ?? 0),
          subtotal: Number(x.SUBTOTAL ?? x.subtotal ?? 0),
          productoId: x.PK_ID_PRODUCTO ?? x.productoId,
        }));

        // Total
        const totalRaw = response.data?.pedido?.total;
        this.totalPedido = Number(
          totalRaw ?? this.productos.reduce((s, p) => s + (p.subtotal || 0), 0),
        );
        this.pedidoId = Number(response.data?.pedido?.pedidoId ?? 0);

        this.logger.log(LogLevel.INFO, 'Detalle domicilio', response);
      });

      this.direccionCliente = params['direccion'] || 'Calle 100 # 13 - 55, Bogotá, Colombia';
      this.telefonoCliente = params['telefono'] || 'No disponible';

      // Observaciones puede venir como: "Método pago: Daviplata - Observaciones: Test"
      this.observacionesRaw = params['observaciones'] || 'Sin observaciones';
      const { metodo, observaciones } = this.parseMetodoYObservaciones(this.observacionesRaw);
      this.metodoPagoTexto = metodo;
      this.observaciones = observaciones;

      if (this.direccionCliente) {
        this.generarRuta();
        this.generarUrlGoogleMaps();
      }
    });
  }

  /**
   * Parsea cadenas del tipo:
   *  - "Método pago: Daviplata - Observaciones: Test"
   *  - "Metodo pago: NEQUI"
   *  - "Observaciones: Entregar en portería"
   *  - o cualquier otra (devuelve todo en observaciones)
   */
  private parseMetodoYObservaciones(s: string): { metodo: string; observaciones: string } {
    if (!s) return { metodo: '', observaciones: '' };

    // Regex tolerante a acentos, espacios y guiones
    const re = /m[eé]todo\s*pago\s*:\s*([^-\n\r]+)?(?:\s*-\s*observaciones\s*:\s*(.+))?/i;
    const m = s.match(re);
    if (m) {
      const metodo = (m[1] ?? '').trim();
      const obs = (m[2] ?? '').trim();
      return {
        metodo,
        observaciones: obs || (!metodo ? s : ''),
      };
    }

    // Plan B sencillo: dividir por " - " y " : "
    if (s.includes(' - ') || s.includes(':')) {
      const trozos = s.split(' - ');
      let metodo = '';
      let obs = '';
      for (const t of trozos) {
        const [k, ...v] = t.split(':');
        const key = (k || '').trim().toLowerCase();
        const val = v.join(':').trim();
        if (key.includes('método') || key.includes('metodo')) metodo = val;
        else if (key.includes('observac')) obs = val;
      }
      if (metodo || obs) return { metodo, observaciones: obs };
    }

    // Si no encaja, lo dejamos entero como observaciones
    return { metodo: '', observaciones: s };
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
            const metodoPagoSeleccionado: string = modalData.select.selected;
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
    const raw = (this.metodoPagoTexto || '').toString().trim().toUpperCase();
    if (!raw) return null;

    // Normalizar posibles variantes (remueve acentos y símbolos)
    const norm = raw
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^A-Z0-9]/g, '')
      .replace(/\s+/g, '');

    if (norm.includes('NEQUI')) return 'NEQUI';
    if (norm.includes('DAVIPLATA') || norm.includes('DAVI')) return 'DAVIPLATA';
    if (norm.includes('EFECTIVO') || norm === 'CASH') return 'EFECTIVO';

    return null;
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
