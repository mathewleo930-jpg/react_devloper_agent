import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

vi.mock('./hooks/useTheme.js', () => ({
  default: () => ({ theme: 'light', toggleTheme: () => {} }),
}));

vi.mock('./api/tasks.js', () => ({
  tasksApi: {
    list: vi.fn(() => Promise.resolve([])),
    stats: vi.fn(() => Promise.resolve({ total: 0, pending: 0, completed: 0, deleted: 0 })),
  },
}));

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return screen.getByRole('navigation', { name: 'Main' });
}

describe('App navigation', () => {
  afterEach(cleanup);

  it('nav has Dashboard and Analytics tabs', async () => {
    const nav = renderAt('/');
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Dashboard', '/'],
      ['Analytics', '/analytics'],
    ]);
    expect(within(nav).getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBe('page');
    await screen.findByRole('heading', { name: 'Dashboard' });
  });

  it('Analytics tab is marked aria-current on /analytics', async () => {
    const nav = renderAt('/analytics');
    expect(within(nav).getByRole('link', { name: 'Analytics' }).getAttribute('aria-current')).toBe('page');
    expect(within(nav).getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBeNull();
    await screen.findByText(/No tasks to chart yet/);
  });

  it('notification bell is the last control in the header', async () => {
    renderAt('/');
    const header = screen.getByRole('banner');
    const bell = within(header).getByRole('button', { name: 'Notifications' });
    const toggle = within(header).getByRole('switch', { name: 'Dark mode' });
    expect(header.lastElementChild).toBe(bell);
    expect(toggle.compareDocumentPosition(bell) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await screen.findByRole('heading', { name: 'Dashboard' });
  });
});
