import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalService } from '../../../core/services/modal.service';
import { UserService } from '../../../core/services/user.service';
import { ModalData } from '../../../shared/models/modal.model';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('100ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '180ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate('120ms ease-out', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ]),
  ],
})
export class ModalComponent implements OnInit {
  isOpen = false;
  modalData: ModalData = {} as ModalData;
  observaciones = ''; // Campo para observaciones del pedido
  currentImage = ''; // Imagen actual a mostrar
  private readonly defaultImage = 'assets/img/logo2.webp'; // Logo por defecto
  private imageErrorOccurred = false; // Flag para evitar loops infinitos
  userRole: string | null = null; // Rol del usuario actual

  constructor(
    private modalService: ModalService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    // Suscribirse a cambios en el estado de autenticación para actualizar el rol
    this.userService.getAuthState().subscribe((isLoggedIn) => {
      this.userRole = isLoggedIn ? this.userService.getUserRole() : null;
    });

    this.modalService.modalData$.subscribe((data) => {
      if (data) {
        this.modalData = data;
        // Resetear la imagen cuando se abre un nuevo modal
        this.imageErrorOccurred = false;
        this.currentImage = data.image || this.defaultImage;
      }
    });

    this.modalService.isOpen$.subscribe((state) => {
      this.isOpen = state;
      // Limpiar observaciones al cerrar el modal
      if (!state) {
        this.observaciones = '';
        this.imageErrorOccurred = false;
      }
    });
  }

  close() {
    this.modalService.closeModal();
  }

  // Manejar error de carga de imagen
  onImageError(): void {
    if (!this.imageErrorOccurred) {
      this.imageErrorOccurred = true;
      this.currentImage = this.defaultImage;
    }
  }

  // Sincronizar observaciones con el servicio cuando cambian
  onObservacionesChange(): void {
    this.modalService.setObservaciones(this.observaciones);
  }

  /**
   * Verifica si el usuario actual puede agregar observaciones a un pedido
   * Solo Cliente, Mesero y Cocinero pueden agregar observaciones
   * Administrador, Domiciliario y Oficios Varios NO pueden
   */
  canAddObservations(): boolean {
    const rolesQueCompran = ['Cliente', 'Mesero'];
    return this.userRole ? rolesQueCompran.includes(this.userRole) : false;
  }
}
