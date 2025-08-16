import { identity } from './coverage-helper';

describe('identity', () => {
  it('returns the provided value', () => {
    expect(identity(5)).toBe(5);
    expect(identity('test')).toBe('test');
  });
});
