import { DomSanitizer } from '@angular/platform-browser';
import { createFullDomSanitizerMock } from '../mocks/test-doubles';

import { SafePipe } from './safe.pipe';

describe('SafePipe', () => {
  let pipe: SafePipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = createFullDomSanitizerMock() as unknown as DomSanitizer;

    pipe = new SafePipe(sanitizer);
  });

  it('should transform value to safe html when type is "html"', () => {
    const value = '<div>test</div>';
    (sanitizer.bypassSecurityTrustHtml as any).mockReturnValue('safeHtml');
    const result = pipe.transform(value, 'html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(value);
    expect(result).toBe('safeHtml');
  });

  it('should transform value to safe style when type is "style"', () => {
    const value = 'color: red;';
    (sanitizer.bypassSecurityTrustStyle as any).mockReturnValue('safeStyle');
    const result = pipe.transform(value, 'style');
    expect(sanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(value);
    expect(result).toBe('safeStyle');
  });

  it('should transform value to safe script when type is "script"', () => {
    const value = 'alert("test")';
    (sanitizer.bypassSecurityTrustScript as any).mockReturnValue('safeScript');
    const result = pipe.transform(value, 'script');
    expect(sanitizer.bypassSecurityTrustScript).toHaveBeenCalledWith(value);
    expect(result).toBe('safeScript');
  });

  it('should transform value to safe url when type is "url"', () => {
    const value = 'http://example.com';
    (sanitizer.bypassSecurityTrustUrl as any).mockReturnValue('safeUrl');
    const result = pipe.transform(value, 'url');
    expect(sanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(value);
    expect(result).toBe('safeUrl');
  });

  it('should transform value to safe resource url when type is "resourceUrl"', () => {
    const value = 'http://example.com/resource';
    (sanitizer.bypassSecurityTrustResourceUrl as any).mockReturnValue('safeResourceUrl');
    const result = pipe.transform(value, 'resourceUrl');
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(value);
    expect(result).toBe('safeResourceUrl');
  });

  it('should throw an error when an invalid type is specified', () => {
    const value = 'test';
    expect(() => pipe.transform(value, 'invalidType')).toThrowError(
      'Invalid safe type specified: invalidType',
    );
  });
});
