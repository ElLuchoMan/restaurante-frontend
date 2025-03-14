import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TomarDomicilioComponent } from './tomar-domicilio.component';

describe('TomarDomicilioComponent', () => {
  let component: TomarDomicilioComponent;
  let fixture: ComponentFixture<TomarDomicilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TomarDomicilioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TomarDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
