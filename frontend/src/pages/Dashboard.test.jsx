import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Dashboard from './Dashboard.jsx';

vi.mock('../api/tasks.js', () => ({
  tasksApi: {
    list: vi.fn(() => Promise.resolve([])),
    stats: vi.fn(() => Promise.resolve({ total: 0, pending: 0, completed: 0 })),
  },
}));

async function renderDashboard() {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
  await screen.findByText('Recent tasks');
  return screen.getByRole('link', { name: '+ Add Task' });
}

describe('Dashboard Add Task button', () => {
  afterEach(cleanup);

  it('renders the Add Task link with the green btn-add class', async () => {
    const link = await renderDashboard();
    expect(link.classList.contains('btn')).toBe(true);
    expect(link.classList.contains('btn-add')).toBe(true);
    expect(link.classList.contains('btn-primary')).toBe(false);
  });

  it('Add Task link still points to /tasks/new', async () => {
    const link = await renderDashboard();
    expect(link.getAttribute('href')).toBe('/tasks/new');
  });
});
