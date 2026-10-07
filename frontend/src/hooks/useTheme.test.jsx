import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../theme.js';
import { createFakeStorage, createMatchMedia } from '../test-utils.js';
import useTheme from './useTheme.js';

describe('useTheme', () => {
  let storage;

  beforeEach(() => {
    storage = createFakeStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('matchMedia', createMatchMedia(false));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
  });

  it('useTheme starts from stored theme and applies it to the document', () => {
    storage.setItem(THEME_STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('toggleTheme switches light to dark and back, updating document and storage', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
