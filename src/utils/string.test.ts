import { describe, expect, it } from 'vitest';

import { anonymizeIp, hashStringToNumber, hashValue, toCamelCase } from './string.js';

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

describe('toCamelCase', () => {
  it('normalizes dashed and underscored values', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld');
    expect(toCamelCase('hello_world')).toBe('helloWorld');
    expect(toCamelCase('hello-world_again')).toBe('helloWorldAgain');
  });

  it('lowercases the first character of existing camel case', () => {
    expect(toCamelCase('AlreadyCamel')).toBe('alreadyCamel');
  });

  it('removes trailing separators', () => {
    expect(toCamelCase('trailing-')).toBe('trailing');
    expect(toCamelCase('trailing_')).toBe('trailing');
  });
});

describe('hashValue', () => {
  it('prefixes the sha256 hash of the value', () => {
    expect(hashValue('hello')).toBe(
      'hash:2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });
});

describe('anonymizeIp', () => {
  it('zeros the last octet of an IPv4 address', () => {
    expect(anonymizeIp('192.168.0.1')).toBe('192.168.0.0');
  });

  it('returns null for invalid IPv4 input', () => {
    expect(anonymizeIp('1.2.3')).toBeNull();
    expect(anonymizeIp('not.an.ip')).toBeNull();
    expect(anonymizeIp('2001:db8::1')).toBeNull();
  });
});
