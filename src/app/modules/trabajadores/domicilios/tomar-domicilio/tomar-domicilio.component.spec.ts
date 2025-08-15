import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TomarDomicilioComponent } from './tomar-domicilio.component';

describe('TomarDomicilioComponent', () => {
  let component: TomarDomicilioComponent;
  let fixture: ComponentFixture<TomarDomicilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TomarDomicilioComponent, HttpClientTestingModule, RouterTestingModule]
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
