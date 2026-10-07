import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

describe('ThemeToggle', () => {
  afterEach(cleanup);

  it('renders a "Dark mode" button not pressed in light theme', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    const button = screen.getByRole('button', { name: 'Dark mode' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('title')).toBe('Switch to dark theme');
  });

  it('renders pressed in dark theme', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    const button = screen.getByRole('button', { name: 'Dark mode' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('title')).toBe('Switch to light theme');
  });

  it('calls onToggle once per click', () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('throws TypeError for an invalid theme prop', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeToggle theme="sepia" onToggle={() => {}} />)).toThrow(TypeError);
    consoleError.mockRestore();
  });
});
