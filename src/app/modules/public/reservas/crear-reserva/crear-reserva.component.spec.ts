import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReservaComponent } from './crear-reserva.component';
import { ReservaService } from '../../../../core/services/reserva.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { estadoReserva } from '../../../../shared/constants';
import { Reserva } from '../../../../shared/models/reserva.model';

describe('CrearReservaComponent', () => {
  let component: CrearReservaComponent;
  let fixture: ComponentFixture<CrearReservaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let userService: jest.Mocked<UserService>;
  let toastr: jest.Mocked<ToastrService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const reservaServiceMock = {
      crearReserva: jest.fn()
    } as unknown as jest.Mocked<ReservaService>;

    const userServiceMock = {
      getUserRole: jest.fn(),
      getUserId: jest.fn(),
      getTrabajadorId: jest.fn(),
      getClienteId: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    const toastrMock = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [CrearReservaComponent, FormsModule, CommonModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearReservaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize role and visibility on ngOnInit', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    component.ngOnInit();
    expect(component.rol).toBe('Cliente');
    expect(component.esAdmin).toBe(false);
    expect(component.mostrarCampo).toBe(false);
  });

  it('should show extra fields when personas is "5+"', () => {
    component.personas = "5+";
    component.checkPersonas();
    expect(component.mostrarInputPersonas).toBe(true);
    expect(component.mostrarInfoEvento).toBe(true);
  });

  it('should hide extra fields when personas is not "5+"', () => {
    component.personas = "4";
    component.checkPersonas();
    expect(component.mostrarInputPersonas).toBe(false);
    expect(component.mostrarInfoEvento).toBe(false);
  });

  it('should handle reservation creation as admin', () => {
    userService.getUserRole.mockReturnValue('Administrador');
    userService.getUserId.mockReturnValue('1');
    userService.getTrabajadorId.mockReturnValue(of({ data: { nombre: 'Admin', apellido: 'User' } }));

    reservaService.crearReserva.mockReturnValue(of({}));

    component.onSubmit();

    expect(userService.getTrabajadorId).toHaveBeenCalledWith(1);
    expect(reservaService.crearReserva).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
  });

  it('should handle reservation creation as client', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    userService.getUserId.mockReturnValue('2');
    userService.getClienteId.mockReturnValue(of({ data: { nombre: 'John', apellido: 'Doe', telefono: '123456789' } }));

    reservaService.crearReserva.mockReturnValue(of({}));

    component.onSubmit();

    expect(userService.getClienteId).toHaveBeenCalledWith(2);
    expect(reservaService.crearReserva).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
  });

  it('should handle reservation creation as anonymous user', () => {
    userService.getUserRole.mockReturnValue(null);
    userService.getUserId.mockReturnValue(null);

    reservaService.crearReserva.mockReturnValue(of({}));

    component.onSubmit();

    expect(reservaService.crearReserva).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
  });

  it('should handle error when reservation creation fails', () => {
    reservaService.crearReserva.mockReturnValue(throwError(() => new Error('Error de API')));

    component.onSubmit();

    expect(toastr.error).toHaveBeenCalledWith('Error de API', 'Error');
  });
});
