import { TestBed } from '@angular/core/testing';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SharedModule } from './shared.module';

describe('SharedModule', () => {
  it('should be instantiable and import standalone components', () => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
    });
    expect(TestBed.inject(SharedModule)).toBeInstanceOf(SharedModule);
  });

  it('should export Header and Footer components', () => {
    const exportsMeta = (SharedModule as any).ɵmod.exports as any[];
    expect(exportsMeta).toEqual(expect.arrayContaining([HeaderComponent, FooterComponent]));
  });
});
