import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { By } from '@angular/platform-browser';

import { PageNotFoundComponent } from './page-not-found.component';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let meta: Meta;
  let title: Title;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotFoundComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                title: 'Home',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    meta = TestBed.inject(Meta);
    title = TestBed.inject(Title);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set correct page title', () => {
    expect(title.getTitle()).toBe('404 - Página no encontrada | El fogón DE MARÍA');
  });

  it('should set correct meta description', () => {
    const metaDescription = meta.getTag('name="description"');
    expect(metaDescription?.content).toContain('La página que buscas no existe');
  });

  it('should set robots meta tag to noindex, nofollow', () => {
    const robotsMeta = meta.getTag('name="robots"');
    expect(robotsMeta?.content).toBe('noindex, nofollow');
  });

  it('should have proper semantic HTML structure', () => {
    const mainElement = fixture.debugElement.query(By.css('main[role="main"]'));
    const sectionElement = fixture.debugElement.query(By.css('section.error-content'));
    const headingElement = fixture.debugElement.query(By.css('h1#not-found-title'));

    expect(mainElement).toBeTruthy();
    expect(sectionElement).toBeTruthy();
    expect(headingElement).toBeTruthy();
  });

  it('should have accessible SVG with proper attributes', () => {
    const svgElement = fixture.debugElement.query(By.css('svg[role="img"]'));
    expect(svgElement).toBeTruthy();
    expect(svgElement.nativeElement.getAttribute('aria-labelledby')).toBe('not-found-title');
    expect(svgElement.nativeElement.getAttribute('aria-describedby')).toBe('not-found-description');
  });

  it('should have accessible button with proper aria-label', () => {
    const buttonElement = fixture.debugElement.query(By.css('a[routerLink="/home"]'));
    expect(buttonElement).toBeTruthy();
    expect(buttonElement.nativeElement.getAttribute('aria-label')).toBe(
      'Volver a la página de inicio del restaurante',
    );
  });

  it('should display correct error messages', () => {
    const errorMessages = fixture.debugElement.queryAll(By.css('.lead'));
    expect(errorMessages.length).toBe(2);
    expect(errorMessages[0].nativeElement.textContent.trim()).toBe('Esta carne aún está cruda 😔');
    expect(errorMessages[1].nativeElement.textContent.trim()).toBe(
      'Vuelve más tarde, quizá ya esté lista',
    );
  });

  it('should have proper heading hierarchy', () => {
    const heading = fixture.debugElement.query(By.css('h1.error-title'));
    expect(heading.nativeElement.textContent.trim()).toBe('404');
    expect(heading.nativeElement.id).toBe('not-found-title');
  });

  it('should have working navigation link', () => {
    const linkElement = fixture.debugElement.query(By.css('a[routerLink="/home"]'));
    expect(linkElement.nativeElement.getAttribute('routerLink')).toBe('/home');
  });
});
