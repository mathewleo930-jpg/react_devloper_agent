import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// jsdom does not apply stylesheets, so the CSS source is checked directly.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'index.css'), 'utf8');

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`CSS rule not found: ${selector}`);
  return match[1];
}

function token(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`));
  if (!match) throw new Error(`Token ${name} not found`);
  return match[1];
}

function toRgb(hex) {
  const digits = hex.slice(1);
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const themes = {
  light: ruleBody(':root'),
  dark: ruleBody(":root[data-theme='dark']"),
};

describe('add-button styles', () => {
  it('defines green add-button tokens in light and dark themes', () => {
    for (const block of Object.values(themes)) {
      for (const name of ['--add-bg', '--add-hover-bg', '--on-add']) {
        expect(() => token(block, name)).not.toThrow();
      }
    }
  });

  it('add-button colours are green', () => {
    for (const block of Object.values(themes)) {
      for (const name of ['--add-bg', '--add-hover-bg']) {
        const [r, g, b] = toRgb(token(block, name));
        expect(g).toBeGreaterThan(r);
        expect(g).toBeGreaterThan(b);
      }
    }
  });

  it('add-button text contrast is at least 4.5:1 in both themes', () => {
    for (const block of Object.values(themes)) {
      const text = token(block, '--on-add');
      expect(contrast(text, token(block, '--add-bg'))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text, token(block, '--add-hover-bg'))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('btn-add rule uses the add tokens', () => {
    const body = ruleBody('.btn-add');
    expect(body).toMatch(/background:\s*var\(--add-bg\)/);
    expect(body).toMatch(/color:\s*var\(--on-add\)/);
  });
});

describe('theme switch styles', () => {
  it('switch track colours contrast at least 3:1 with the surface in both themes', () => {
    for (const block of Object.values(themes)) {
      const surface = token(block, '--surface');
      expect(contrast(token(block, '--muted'), surface)).toBeGreaterThanOrEqual(3);
      expect(contrast(token(block, '--primary'), surface)).toBeGreaterThanOrEqual(3);
    }
  });

  it('checked switch uses the primary track colour', () => {
    const body = ruleBody(".theme-switch[aria-checked='true'] .theme-switch-track");
    expect(body).toMatch(/background:\s*var\(--primary\)/);
  });

  it('switch has a visible focus outline and 44px touch target', () => {
    expect(ruleBody('.theme-switch:focus-visible')).toMatch(/outline:\s*2px solid var\(--primary\)/);
    expect(ruleBody('.theme-switch')).toMatch(/min-height:\s*44px/);
  });
});
