import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { NativeTopbarComponent } from './native-topbar.component';

class UserServiceStub {
  private auth$ = new BehaviorSubject<boolean>(false);
  getAuthState() {
    return this.auth$.asObservable();
  }
}
class CartServiceStub {
  count$ = new BehaviorSubject<number>(2);
}

describe('NativeTopbarComponent', () => {
  let component: NativeTopbarComponent;
  let fixture: ComponentFixture<NativeTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeTopbarComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: CartService, useClass: CartServiceStub },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NativeTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el logo con enlace a Home', () => {
    const link = fixture.debugElement.query(By.css('a[aria-label="Ir al inicio"]'));
    expect(link).toBeTruthy();
  });
});
