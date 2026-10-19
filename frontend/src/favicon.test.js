import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const frontendDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(frontendDir, 'index.html'), 'utf8');
const logoSvg = readFileSync(join(frontendDir, 'public', 'logo.svg'), 'utf8');
const logo = new DOMParser().parseFromString(logoSvg, 'image/svg+xml').documentElement;

describe('favicon', () => {
  it('index.html links logo.svg as an SVG favicon', () => {
    const doc = new DOMParser().parseFromString(indexHtml, 'text/html');
    const icon = doc.querySelector('link[rel="icon"]');
    expect(icon).not.toBeNull();
    expect(icon.getAttribute('type')).toBe('image/svg+xml');
    expect(icon.getAttribute('href')).toBe('/logo.svg');
  });

  it('logo.svg declares xmlns and a 64x64 viewBox', () => {
    expect(logo.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(logo.getAttribute('viewBox')).toBe('0 0 64 64');
  });

  it('logo.svg is the real company logo, not the placeholder', () => {
    expect(logoSvg).not.toMatch(/Placeholder/i);
  });

  it('logo.svg has an accessible title', () => {
    expect(logo.querySelector('title').textContent).toBe('Deskline logo');
  });

  it('logo.svg sits on an opaque white tile so it reads in dark theme', () => {
    const tile = logo.querySelector('rect');
    expect(tile.getAttribute('width')).toBe('64');
    expect(tile.getAttribute('height')).toBe('64');
    expect(tile.getAttribute('fill')).toBe('#ffffff');
    expect(tile.hasAttribute('x') || tile.hasAttribute('y')).toBe(false);
  });

  it('logo.svg uses the brand navy and slate colours', () => {
    expect(logoSvg).toContain('#1f5b94');
    expect(logoSvg).toContain('#6b7f96');
  });
});
