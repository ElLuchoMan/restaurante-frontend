import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarDomiciliosComponent } from './consultar-domicilios.component';

describe('ConsultarDomiciliosComponent', () => {
  let component: ConsultarDomiciliosComponent;
  let fixture: ComponentFixture<ConsultarDomiciliosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarDomiciliosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarDomiciliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
