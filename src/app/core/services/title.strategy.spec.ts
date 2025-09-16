import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';

import { AppTitleStrategy } from './title.strategy';

function createSnapshot(title?: string): RouterStateSnapshot {
  return {
    toString: () => 'snapshot',
  } as any as RouterStateSnapshot;
}

describe('AppTitleStrategy', () => {
  let setTitleSpy: jest.SpyInstance;
  let title: Title;
  let strat: AppTitleStrategy;

  beforeEach(() => {
    title = new Title(document);
    setTitleSpy = jest.spyOn(title, 'setTitle');
    strat = new AppTitleStrategy(title);
  });

  it('setea prefijo cuando no hay título de ruta', () => {
    // buildTitle devolvería undefined => prefijo
    strat.updateTitle(createSnapshot());
    expect(setTitleSpy).toHaveBeenCalledWith('La cocina de María');
  });

  it('concatena prefijo con título cuando existe', () => {
    // forzar buildTitle
    const snap: any = createSnapshot();
    jest.spyOn(AppTitleStrategy.prototype as any, 'buildTitle').mockReturnValue('Página X');
    strat.updateTitle(snap);
    expect(setTitleSpy).toHaveBeenCalledWith('La cocina de María — Página X');
  });
});
