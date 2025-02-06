import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarReservaComponent } from './consultar-reserva.component';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { Reserva } from '../../../../shared/models/reserva.model';

describe('ConsultarReservaComponent', () => {
  let component: ConsultarReservaComponent;
  let fixture: ComponentFixture<ConsultarReservaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let toastr: jest.Mocked<ToastrService>;

  const mockReserva = {
    reservaId: 1,
    documentoCliente: 123456,
    telefono: '123456789',
    fechaReserva: '01-01-2025',
    horaReserva: '18:00',
    personas: 4,
    estadoReserva: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'John Doe',
    updatedAt: new Date().toISOString(),
    updatedBy: 'testUser'
  };

  beforeEach(async () => {
    const reservaServiceMock = {
      getReservaByParameter: jest.fn(),
      actualizarReserva: jest.fn()
    } as unknown as jest.Mocked<ReservaService>;

    const toastrMock = {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    await TestBed.configureTestingModule({
      imports: [ConsultarReservaComponent, FormsModule, CommonModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarReservaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset reservations and message when no search criteria is selected', () => {
    component.buscarPorDocumento = false;
    component.buscarPorFecha = false;
    component.actualizarTipoBusqueda();
    expect(component.reservas).toEqual([]);
    expect(component.mostrarMensaje).toBe(false);
  });

  it('should show warning if no search criteria is selected', () => {
    component.buscarReserva();
    expect(toastr.warning).toHaveBeenCalledWith('Selecciona al menos un criterio de búsqueda', 'Atención');
  });

  it('should show warning if document is required but missing', () => {
    component.buscarPorDocumento = true;
    component.documentoCliente = '';
    component.buscarReserva();
    expect(toastr.warning).toHaveBeenCalledWith('Por favor ingresa un documento', 'Atención');
  });

  it('should show warning if date is required but missing', () => {
    component.buscarPorFecha = true;
    component.fechaReserva = '';
    component.buscarReserva();
    expect(toastr.warning).toHaveBeenCalledWith('Por favor selecciona una fecha', 'Atención');
  });

  it('should show error if document is invalid', () => {
    component.buscarPorDocumento = true;
    component.documentoCliente = 'abc';
    component.buscarReserva();
    expect(toastr.error).toHaveBeenCalledWith('El documento debe ser un número válido', 'Error');
  });

  it('should call reservaService.getReservaByParameter with correct params', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas obtenidas con éxito',
      data: [mockReserva]
    };

    reservaService.getReservaByParameter.mockReturnValue(of(mockResponse));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-01';

    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(123456, '2025-01-01');
    expect(component.reservas.length).toBe(1);
  });

  it('should handle error when searching for reservations', () => {
    reservaService.getReservaByParameter.mockReturnValue(throwError(() => new Error()));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';

    component.buscarReserva();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al buscar la reserva', 'Error');
  });

  it('should confirm a reservation and update its status', () => {
    const mockUpdateResponse: ApiResponse<Reserva> = {
      code: 200,
      message: 'Reserva actualizada con éxito',
      data: mockReserva
    };

    reservaService.actualizarReserva.mockReturnValue(of(mockUpdateResponse));


    component.confirmarReserva(mockReserva);

    expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, expect.objectContaining({ estadoReserva: 'CONFIRMADA' }));
    expect(toastr.success).toHaveBeenCalledWith('Reserva marcada como CONFIRMADA', 'Actualización Exitosa');
  });

  it('should cancel a reservation and update its status', () => {
    const mockUpdateResponse: ApiResponse<Reserva> = {
      code: 200,
      message: 'Reserva actualizada con éxito',
      data: mockReserva
    };

    reservaService.actualizarReserva.mockReturnValue(of(mockUpdateResponse));


    component.cancelarReserva(mockReserva);

    expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, expect.objectContaining({ estadoReserva: 'CANCELADA' }));
    expect(toastr.success).toHaveBeenCalledWith('Reserva marcada como CANCELADA', 'Actualización Exitosa');
  });

  it('should fulfill a reservation and update its status', () => {
    const mockUpdateResponse: ApiResponse<Reserva> = {
      code: 200,
      message: 'Reserva actualizada con éxito',
      data: mockReserva
    };

    reservaService.actualizarReserva.mockReturnValue(of(mockUpdateResponse));


    component.cumplirReserva(mockReserva);

    expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, expect.objectContaining({ estadoReserva: 'CUMPLIDA' }));
    expect(toastr.success).toHaveBeenCalledWith('Reserva marcada como CUMPLIDA', 'Actualización Exitosa');
  });

  it('should show error if updating a reservation fails', () => {
    reservaService.actualizarReserva.mockReturnValue(throwError(() => new Error()));

    component.confirmarReserva(mockReserva);

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al actualizar la reserva', 'Error');
  });

  it('should show error if reservaId is invalid', () => {
    const invalidReserva = { ...mockReserva, reservaId: NaN };
    component.confirmarReserva(invalidReserva);
    expect(toastr.error).toHaveBeenCalledWith('Error: ID de reserva no válido', 'Error');
  });
  it('should sort reservations by date (desc) and time (desc)', () => {
    const unorderedReservas: Reserva[] = [
      {
        reservaId: 1,
        documentoCliente: 123456,
        telefono: '123456789',
        fechaReserva: '01-01-2025',
        horaReserva: '14:00',
        personas: 4,
        estadoReserva: 'PENDIENTE',
        createdAt: new Date().toISOString(),
        createdBy: 'testUser',
        indicaciones: 'Ninguna',
        nombreCompleto: 'John Doe',
        updatedAt: new Date().toISOString(),
        updatedBy: 'testUser'
      },
      {
        reservaId: 2,
        documentoCliente: 123456,
        telefono: '123456789',
        fechaReserva: '02-01-2025',
        horaReserva: '16:00',
        personas: 2,
        estadoReserva: 'CONFIRMADA',
        createdAt: new Date().toISOString(),
        createdBy: 'testUser',
        indicaciones: 'Ninguna',
        nombreCompleto: 'John Doe',
        updatedAt: new Date().toISOString(),
        updatedBy: 'testUser'
      },
      {
        reservaId: 3,
        documentoCliente: 123456,
        telefono: '123456789',
        fechaReserva: '01-01-2025',
        horaReserva: '18:00',
        personas: 3,
        estadoReserva: 'CANCELADA',
        createdAt: new Date().toISOString(),
        createdBy: 'testUser',
        indicaciones: 'Ninguna',
        nombreCompleto: 'John Doe',
        updatedAt: new Date().toISOString(),
        updatedBy: 'testUser'
      }
    ];

    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas obtenidas',
      data: unorderedReservas
    };

    reservaService.getReservaByParameter.mockReturnValue(of(mockResponse));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(123456, undefined);

    // Comparar solo fechas y horas en lugar de toda la estructura
    expect(component.reservas.map(r => ({ fecha: r.fechaReserva, hora: r.horaReserva })))
      .toEqual([
        { fecha: '02-01-2025', hora: '16:00' }, // Más reciente
        { fecha: '01-01-2025', hora: '18:00' }, // Mismo día, hora más tarde
        { fecha: '01-01-2025', hora: '14:00' }  // Mismo día, hora más temprano
      ]);
  });
  it('should return the same date if it has three parts', () => {
    const result = component['convertirFechaISO']('2025-01-15');
    expect(result).toBe('2025-01-15');
  });

  it('should return the original string if it does not have three parts', () => {
    const result = component['convertirFechaISO']('invalid-date');
    expect(result).toBe('invalid-date');
  });
  it('should return the same date if it has three parts', () => {
    const result = component['convertirFechaISO']('2025-01-15');
    expect(result).toBe('2025-01-15');
  });

  it('should return the original string if it does not have three parts', () => {
    const result = component['convertirFechaISO']('invalid-date');
    expect(result).toBe('invalid-date');
  });

});
