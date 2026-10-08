import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Dashboard from './Dashboard.jsx';

vi.mock('../api/tasks.js', () => ({
  tasksApi: {
    list: vi.fn(() => Promise.resolve([])),
    stats: vi.fn(() => Promise.resolve({ total: 0, pending: 0, completed: 0 })),
    complete: vi.fn(),
    remove: vi.fn(),
  },
}));

async function renderDashboard() {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
  await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull());
}

describe('Dashboard', () => {
  afterEach(cleanup);

  it('Add Task link uses the green btn-add style', async () => {
    await renderDashboard();
    const link = screen.getByRole('link', { name: '+ Add Task' });
    expect(link.classList.contains('btn-add')).toBe(true);
    expect(link.classList.contains('btn-primary')).toBe(false);
  });

  it('Add Task link points to /tasks/new', async () => {
    await renderDashboard();
    const link = screen.getByRole('link', { name: '+ Add Task' });
    expect(link.getAttribute('href')).toBe('/tasks/new');
  });
});
