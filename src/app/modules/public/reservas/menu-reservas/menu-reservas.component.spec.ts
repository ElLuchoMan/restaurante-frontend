import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuReservasComponent } from './menu-reservas.component';

describe('MenuReservasComponent', () => {
  let component: MenuReservasComponent;
  let fixture: ComponentFixture<MenuReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
