import { describe, expect, it } from 'vitest';

import { hashStringToNumber } from './hashStringToNumber.js';

describe('hashStringToNumber', () => {
  it('hashes the empty string to the offset basis', () => {
    expect(hashStringToNumber('')).toBe(2166136261);
  });

  it('produces expected hashes for common inputs', () => {
    expect(hashStringToNumber('a')).toBe(3826002220);
    expect(hashStringToNumber('hello')).toBe(1335831723);
    expect(hashStringToNumber('hello world')).toBe(3582672807);
    expect(hashStringToNumber('The quick brown fox jumps over the lazy dog')).toBe(76545936);
  });

  it('treats unicode as UTF-16 code units', () => {
    expect(hashStringToNumber('😀')).toBe(3409036472);
  });

  it('returns an unsigned 32-bit integer deterministically', () => {
    const value = hashStringToNumber('repeatable');
    expect(value).toBe(hashStringToNumber('repeatable'));
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(0xffffffff);
  });
});
