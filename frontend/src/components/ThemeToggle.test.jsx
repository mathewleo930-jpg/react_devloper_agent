import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useTheme from '../hooks/useTheme.js';
import { THEME_STORAGE_KEY } from '../theme.js';
import { createFakeStorage, createMatchMedia } from '../test-utils.js';
import ThemeToggle from './ThemeToggle.jsx';

function getSwitch() {
  return screen.getByRole('switch', { name: 'Dark mode' });
}

describe('ThemeToggle', () => {
  afterEach(cleanup);

  it('renders an unchecked "Dark mode" switch in light theme', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    const toggle = getSwitch();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(toggle.getAttribute('title')).toBe('Switch to dark theme');
  });

  it('renders a checked switch in dark theme', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    const toggle = getSwitch();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(toggle.getAttribute('title')).toBe('Switch to light theme');
  });

  it('calls onToggle once per click', () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    fireEvent.click(getSwitch());
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  // jsdom does not turn Enter/Space key presses into clicks, so the native
  // button semantics that give browsers that behaviour are asserted instead.
  it('is a native button so Enter and Space activate it', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    const toggle = getSwitch();
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.disabled).toBe(false);
  });

  it('is reachable by keyboard focus', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    const toggle = getSwitch();
    toggle.focus();
    expect(document.activeElement).toBe(toggle);
  });

  it('throws TypeError for an invalid theme prop', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeToggle theme="sepia" onToggle={() => {}} />)).toThrow(TypeError);
    consoleError.mockRestore();
  });
});

function Harness() {
  const { theme, toggleTheme } = useTheme();
  return <ThemeToggle theme={theme} onToggle={toggleTheme} />;
}

describe('ThemeToggle with useTheme', () => {
  let storage;

  function setup({ saved, prefersDark = false } = {}) {
    storage = createFakeStorage(saved ? { [THEME_STORAGE_KEY]: saved } : {});
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('matchMedia', createMatchMedia(prefersDark));
    render(<Harness />);
    return getSwitch();
  }

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
  });

  it('switch starts on when the saved theme is dark', () => {
    const toggle = setup({ saved: 'dark' });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('switch starts on from system dark preference when nothing is saved', () => {
    const toggle = setup({ prefersDark: true });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('saved light theme overrides system dark preference', () => {
    const toggle = setup({ saved: 'light', prefersDark: true });
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('clicking the switch flips aria-checked, data-theme and the saved theme', () => {
    const toggle = setup();
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
