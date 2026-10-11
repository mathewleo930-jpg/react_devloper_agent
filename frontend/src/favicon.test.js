import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const frontendDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(frontendDir, 'index.html'), 'utf8');
const logoSvg = readFileSync(join(frontendDir, 'public', 'logo.svg'), 'utf8');

describe('favicon', () => {
  it('index.html links logo.svg as an SVG favicon', () => {
    const doc = new DOMParser().parseFromString(indexHtml, 'text/html');
    const icon = doc.querySelector('link[rel="icon"]');
    expect(icon).not.toBeNull();
    expect(icon.getAttribute('type')).toBe('image/svg+xml');
    expect(icon.getAttribute('href')).toBe('/logo.svg');
  });

  it('logo.svg declares xmlns and viewBox', () => {
    const svg = new DOMParser().parseFromString(logoSvg, 'image/svg+xml').documentElement;
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 32 32');
  });

  it('logo.svg is marked as a placeholder to replace', () => {
    expect(logoSvg).toMatch(/Placeholder company logo – replace with the official SVG, keep the file name logo\.svg/);
  });
});
