import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { QuickActionsComponent } from './quick-actions.component';

class UserServiceStub {
  private auth$ = new BehaviorSubject<boolean>(false);
  getAuthState() {
    return this.auth$.asObservable();
  }
  logout() {
    this.auth$.next(false);
  }
}

describe('QuickActionsComponent', () => {
  let component: QuickActionsComponent;
  let fixture: ComponentFixture<QuickActionsComponent>;

  beforeEach(async () => {
    (window as any).IntersectionObserver = class {
      constructor() {}
      observe() {}
      disconnect() {}
    } as any;

    await TestBed.configureTestingModule({
      imports: [QuickActionsComponent, RouterTestingModule],
      providers: [{ provide: UserService, useClass: UserServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('muestra 4 accesos', () => {
    const items = fixture.debugElement.queryAll(By.css('.qa-item'));
    expect(items.length).toBe(4);
  });
});
