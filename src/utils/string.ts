import { createHash } from 'node:crypto';

export const hashStringToNumber = (str: string): number => {
  let hash = 0x811c9dc5; // FNV offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  // Convert to unsigned 32-bit integer
  return hash >>> 0;
};

export const toCamelCase = (value: string): string => {
  const normalized = value.replace(/[-_]+(.)?/g, (_, chr: string) =>
    chr ? chr.toUpperCase() : ''
  );

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
};

export const hashValue = (value: string): string =>
  `hash:${createHash('sha256').update(value).digest('hex')}`;

export const anonymizeIp = (value: string): null | string => {
  const ipv4Parts = value.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.${ipv4Parts[2]}.0`;
  }

  return null;
};
