import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from './perfil';
import { UserService } from '../../../core/services/user.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async () => {
    const userServiceMock = {
      getUserId: jest.fn().mockReturnValue(1),
      decodeToken: jest.fn().mockReturnValue({ nombre: 'Cliente' }),
    } as unknown as UserService;
    const clienteServiceMock = {
      getClienteId: jest.fn().mockReturnValue(of({ data: {} })),
    } as unknown as ClienteService;
    const toastrMock = { error: jest.fn() } as unknown as ToastrService;

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
