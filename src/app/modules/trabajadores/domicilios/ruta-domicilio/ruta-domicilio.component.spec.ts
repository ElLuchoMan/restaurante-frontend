import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutaDomicilioComponent } from './ruta-domicilio.component';

describe('RutaDomicilioComponent', () => {
  let component: RutaDomicilioComponent;
  let fixture: ComponentFixture<RutaDomicilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutaDomicilioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutaDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
