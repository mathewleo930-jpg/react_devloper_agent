// @vitest-environment node
// Node environment so import.meta.url is a file: URL readable by fs.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

const TOKENS = ['--add-task-bg', '--add-task-hover', '--on-add-task'];

function block(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`CSS block not found: ${selector}`);
  return css.slice(start, css.indexOf('}', start));
}

const themes = {
  light: block(':root'),
  dark: block(":root[data-theme='dark']"),
};

function token(source, name) {
  const match = source.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Token ${name} not found`);
  return match[1];
}

function rgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

function hue(hex) {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('Add Task button styles', () => {
  it('defines add-task tokens in light and dark themes', () => {
    for (const source of Object.values(themes)) {
      for (const name of TOKENS) expect(source).toContain(`${name}:`);
    }
  });

  it('add-task colours are green', () => {
    for (const source of Object.values(themes)) {
      const h = hue(token(source, '--add-task-bg'));
      expect(h).toBeGreaterThanOrEqual(90);
      expect(h).toBeLessThanOrEqual(160);
    }
  });

  it('add-task text meets 4.5:1 contrast in both themes', () => {
    for (const source of Object.values(themes)) {
      const text = token(source, '--on-add-task');
      expect(contrast(text, token(source, '--add-task-bg'))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text, token(source, '--add-task-hover'))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('btn-add rule uses the tokens', () => {
    const rule = block('.btn-add');
    expect(rule).toContain('var(--add-task-bg)');
    expect(rule).toContain('var(--on-add-task)');
  });
});
