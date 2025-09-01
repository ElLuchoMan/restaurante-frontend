import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
} from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';

describe('SafePipe', () => {
  let pipe: SafePipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('safeHtml' as unknown as SafeHtml),
      bypassSecurityTrustStyle: jest.fn().mockReturnValue('safeStyle' as unknown as SafeStyle),
      bypassSecurityTrustScript: jest.fn().mockReturnValue('safeScript' as unknown as SafeScript),
      bypassSecurityTrustUrl: jest.fn().mockReturnValue('safeUrl' as unknown as SafeUrl),
      bypassSecurityTrustResourceUrl: jest
        .fn()
        .mockReturnValue('safeResourceUrl' as unknown as SafeResourceUrl),
      sanitize: jest.fn(),
    } as unknown as DomSanitizer;

    pipe = new SafePipe(sanitizer);
  });

  it('should transform value to safe html when type is "html"', () => {
    const value = '<div>test</div>';
    const result = pipe.transform(value, 'html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(value);
    expect(result).toBe('safeHtml');
  });

  it('should transform value to safe style when type is "style"', () => {
    const value = 'color: red;';
    const result = pipe.transform(value, 'style');
    expect(sanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(value);
    expect(result).toBe('safeStyle');
  });

  it('should transform value to safe script when type is "script"', () => {
    const value = 'alert("test")';
    const result = pipe.transform(value, 'script');
    expect(sanitizer.bypassSecurityTrustScript).toHaveBeenCalledWith(value);
    expect(result).toBe('safeScript');
  });

  it('should transform value to safe url when type is "url"', () => {
    const value = 'http://example.com';
    const result = pipe.transform(value, 'url');
    expect(sanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(value);
    expect(result).toBe('safeUrl');
  });

  it('should transform value to safe resource url when type is "resourceUrl"', () => {
    const value = 'http://example.com/resource';
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
