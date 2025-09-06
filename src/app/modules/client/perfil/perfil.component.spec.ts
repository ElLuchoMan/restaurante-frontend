import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { ClienteService } from '../../../core/services/cliente.service';
import { UserService } from '../../../core/services/user.service';
import { createClienteServiceMock, createToastrMock, createUserServiceMock } from '../../../shared/mocks/test-doubles';
import { PerfilComponent } from './perfil.component';

describe('PerfilComponent', () => {
  const setup = async (
    userServiceMock: Partial<UserService>,
    clienteServiceMock: Partial<ClienteService>,
    toastrMock: Partial<ToastrService> = createToastrMock(),
  ) => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PerfilComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    return { fixture, component, router, toastrMock, clienteServiceMock };
  };

  it('should load client data successfully', async () => {
    const userServiceMock = createUserServiceMock();
    userServiceMock.getUserId.mockReturnValue(1);
    userServiceMock.decodeToken.mockReturnValue({
      nombre: 'Cliente',
      rol: 'Cliente',
      documento: 1,
      exp: Math.floor(Date.now() / 1000) + 1000,
    } as any);
    const clienteData = {
      direccion: 'Calle 1',
      telefono: '123456',
      observaciones: 'Cliente frecuente',
      correo: 'test@example.com',
    };
    const clienteServiceMock = createClienteServiceMock();
    (clienteServiceMock.getClienteId as any).mockReturnValue(of({ data: clienteData }));

    const { fixture, component, router } = await setup(userServiceMock, clienteServiceMock);
    const navigateSpy = jest.spyOn(router, 'navigate');
    fixture.detectChanges();

    expect(component.direccion).toBe('Calle 1');
    expect(component.telefono).toBe('123456');
    expect(component.observaciones).toBe('Cliente frecuente');
    expect(component.correo).toBe('test@example.com');
    expect(component.cargando).toBe(false);
    expect(component.errorCargando).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to login when user id is missing', async () => {
    const userServiceMock = createUserServiceMock();
    userServiceMock.getUserId.mockReturnValue(0);
    userServiceMock.decodeToken.mockReturnValue(undefined as any);
    const clienteServiceMock = createClienteServiceMock();

    const {
      fixture,
      router,
      clienteServiceMock: clienteMock,
    } = await setup(userServiceMock, clienteServiceMock);
    const navigateSpy = jest.spyOn(router, 'navigate');
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(clienteMock.getClienteId).not.toHaveBeenCalled();
  });

  it('should handle error when service fails', async () => {
    const userServiceMock = createUserServiceMock();
    userServiceMock.getUserId.mockReturnValue(1);
    userServiceMock.decodeToken.mockReturnValue({
      nombre: 'Cliente',
      rol: 'Cliente',
      documento: 1,
      exp: Math.floor(Date.now() / 1000) + 1000,
    } as any);
    const clienteServiceMock = createClienteServiceMock();
    (clienteServiceMock.getClienteId as any).mockReturnValue(throwError(() => new Error('fail')));
    const toastrMock = createToastrMock();

    const { fixture, component } = await setup(userServiceMock, clienteServiceMock, toastrMock);
    fixture.detectChanges();

    expect(toastrMock.error).toHaveBeenCalledWith('Error al cargar los datos del cliente', 'Error');
    expect(component.direccion).toBe('No registrada');
    expect(component.telefono).toBe('No registrado');
    expect(component.observaciones).toBe('');
    expect(component.cargando).toBe(false);
    expect(component.errorCargando).toBe(true);
  });

  it('should leave observaciones empty when not frequent client', async () => {
    const userServiceMock = createUserServiceMock();
    userServiceMock.getUserId.mockReturnValue(1);
    userServiceMock.decodeToken.mockReturnValue({
      nombre: 'Cliente',
      rol: 'Cliente',
      documento: 1,
      exp: Math.floor(Date.now() / 1000) + 1000,
    } as any);
    const clienteData = {
      direccion: 'Calle 2',
      telefono: '654321',
      observaciones: 'Ocasional',
      correo: 'mail@test.com',
    };
    const clienteServiceMock = createClienteServiceMock();
    (clienteServiceMock.getClienteId as any).mockReturnValue(of({ data: clienteData }));

    const { fixture, component } = await setup(userServiceMock, clienteServiceMock);
    fixture.detectChanges();

    expect(component.observaciones).toBe('');
    expect(component.direccion).toBe('Calle 2');
    expect(component.telefono).toBe('654321');
  });

  it('should use default values when response has no data and token lacks name', async () => {
    const userServiceMock = createUserServiceMock();
    userServiceMock.getUserId.mockReturnValue(1);
    userServiceMock.decodeToken.mockReturnValue(null as any);
    const clienteServiceMock = createClienteServiceMock();
    (clienteServiceMock.getClienteId as any).mockReturnValue(of({}));

    const { fixture, component } = await setup(userServiceMock, clienteServiceMock);
    fixture.detectChanges();

    expect(component.nombre).toBe('Cliente');
    expect(component.direccion).toBe('No registrada');
    expect(component.telefono).toBe('No registrado');
    expect(component.correo).toBe('No registrado');
  });
});
