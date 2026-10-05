/** @jest-environment node */
import { getSafeImageSrc } from './image.utils';

describe('image.utils (SSR, sin window/document)', () => {
  it('trata el entorno como no WebView y devuelve blob URL original sin fallback', () => {
    expect(typeof window).toBe('undefined');
    const blob = 'blob:http://localhost/abc';
    expect(getSafeImageSrc(blob, 1)).toBe(blob);
  });
});
