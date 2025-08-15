import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ConsultarDomicilioComponent } from './consultar-domicilios.component';

describe('ConsultarDomiciliosComponent', () => {
  let component: ConsultarDomicilioComponent;
  let fixture: ComponentFixture<ConsultarDomicilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarDomicilioComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
