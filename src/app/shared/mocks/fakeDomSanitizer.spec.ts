import { FakeDomSanitizer } from './fakeDomSanitizer';

describe('FakeDomSanitizer', () => {
  let sanitizer: FakeDomSanitizer;

  beforeEach(() => {
    sanitizer = new FakeDomSanitizer();
  });

  it('bypassSecurityTrustResourceUrl should wrap URL', () => {
    const url = 'http://example.com';
    const result = sanitizer.bypassSecurityTrustResourceUrl(url);
    expect(result.toString()).toBe(url);
  });

  it('sanitize should return null when value is falsy', () => {
    expect(sanitizer.sanitize(0, null)).toBeNull();
  });

  it('sanitize should return string representation', () => {
    const value = 'test';
    expect(sanitizer.sanitize(0, value)).toBe(value);
  });

  it('bypassSecurityTrustHtml should return provided value', () => {
    const value = '<div>safe</div>';
    expect(sanitizer.bypassSecurityTrustHtml(value)).toBe(value as any);
  });

  it('bypassSecurityTrustStyle should return provided value', () => {
    const value = 'color:red';
    expect(sanitizer.bypassSecurityTrustStyle(value)).toBe(value as any);
  });

  it('bypassSecurityTrustScript should return provided value', () => {
    const value = 'alert(1)';
    expect(sanitizer.bypassSecurityTrustScript(value)).toBe(value as any);
  });

  it('bypassSecurityTrustUrl should return provided value', () => {
    const value = 'http://example.com';
    expect(sanitizer.bypassSecurityTrustUrl(value)).toBe(value as any);
  });
});
