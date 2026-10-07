import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, applyTheme, getInitialTheme, persistTheme } from './theme.js';
import { createFakeStorage, createMatchMedia } from './test-utils.js';

describe('getInitialTheme', () => {
  it('getInitialTheme returns stored dark theme', () => {
    const storage = createFakeStorage({ [THEME_STORAGE_KEY]: 'dark' });
    expect(getInitialTheme(storage, createMatchMedia(false))).toBe('dark');
  });

  it('getInitialTheme prefers stored light over OS dark preference', () => {
    const storage = createFakeStorage({ [THEME_STORAGE_KEY]: 'light' });
    expect(getInitialTheme(storage, createMatchMedia(true))).toBe('light');
  });

  it('getInitialTheme ignores invalid stored value and uses OS dark preference', () => {
    const storage = createFakeStorage({ [THEME_STORAGE_KEY]: 'purple' });
    expect(getInitialTheme(storage, createMatchMedia(true))).toBe('dark');
  });

  it('getInitialTheme defaults to light without storage value or matchMedia', () => {
    expect(getInitialTheme(createFakeStorage(), undefined)).toBe('light');
  });

  it('getInitialTheme falls back when storage access throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(getInitialTheme(storage, createMatchMedia(true))).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('applyTheme sets data-theme and color-scheme on root', () => {
    const root = document.createElement('html');
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('applyTheme throws TypeError naming the invalid value', () => {
    const root = document.createElement('html');
    expect(() => applyTheme('blue', root)).toThrow(TypeError);
    expect(() => applyTheme('blue', root)).toThrow('Invalid theme: "blue"');
    expect(root.dataset.theme).toBeUndefined();
  });
});

describe('persistTheme', () => {
  it('persistTheme writes theme under the storage key', () => {
    const storage = createFakeStorage();
    persistTheme('dark', storage);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('persistTheme throws TypeError for invalid theme', () => {
    const storage = createFakeStorage();
    expect(() => persistTheme(null, storage)).toThrow(TypeError);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('persistTheme does not throw when storage write fails', () => {
    const storage = {
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => persistTheme('light', storage)).not.toThrow();
  });
});
