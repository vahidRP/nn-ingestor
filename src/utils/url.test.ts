import { describe, expect, it } from 'vitest';

import { stripQueryParams } from './url.js';

describe('stripQueryParams', () => {
  it('removes query params and hash fragments', () => {
    expect(stripQueryParams('https://example.com/path?foo=1&bar=2#section')).toBe(
      'https://example.com/path'
    );
  });

  it('removes query params while preserving the path', () => {
    expect(stripQueryParams('https://example.com/path/?foo=1')).toBe('https://example.com/path/');
  });

  it('returns the input for invalid URLs', () => {
    expect(stripQueryParams('not a url')).toBe('not a url');
  });
});
