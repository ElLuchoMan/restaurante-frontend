import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicacionRestauranteComponent } from './ubicacion-restaurante.component';

describe('UbicacionRestauranteComponent', () => {
  let component: UbicacionRestauranteComponent;
  let fixture: ComponentFixture<UbicacionRestauranteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbicacionRestauranteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbicacionRestauranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
