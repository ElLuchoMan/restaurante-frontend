import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDomiciliosComponent } from './menu-domicilios.component';

describe('MenuDomiciliosComponent', () => {
  let component: MenuDomiciliosComponent;
  let fixture: ComponentFixture<MenuDomiciliosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDomiciliosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuDomiciliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
