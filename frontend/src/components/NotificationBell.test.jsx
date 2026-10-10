import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import NotificationBell from './NotificationBell.jsx';

function getBell() {
  return screen.getByRole('button', { name: 'Notifications' });
}

describe('NotificationBell', () => {
  afterEach(cleanup);

  it('renders a button named "Notifications"', () => {
    render(<NotificationBell />);
    expect(getBell()).toBeTruthy();
  });

  it('is a native type="button" that is focusable by keyboard', () => {
    render(<NotificationBell />);
    const bell = getBell();
    expect(bell.tagName).toBe('BUTTON');
    expect(bell.getAttribute('type')).toBe('button');
    bell.focus();
    expect(document.activeElement).toBe(bell);
  });

  it('is marked aria-disabled because it has no action yet', () => {
    render(<NotificationBell />);
    const bell = getBell();
    expect(bell.getAttribute('aria-disabled')).toBe('true');
    expect(bell.getAttribute('title')).toBe('Notifications (coming soon)');
  });

  it('bell icon is hidden from screen readers', () => {
    render(<NotificationBell />);
    expect(getBell().querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });

  it('clicking does nothing and does not throw', () => {
    const { container } = render(<NotificationBell />);
    const before = container.innerHTML;
    expect(() => fireEvent.click(getBell())).not.toThrow();
    expect(container.innerHTML).toBe(before);
  });
});
