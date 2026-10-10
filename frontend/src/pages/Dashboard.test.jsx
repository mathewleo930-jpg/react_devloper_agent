import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tasksApi } from '../api/tasks.js';
import Dashboard from './Dashboard.jsx';

vi.mock('../api/tasks.js', () => ({
  tasksApi: {
    list: vi.fn(() => Promise.resolve([])),
    stats: vi.fn(() => Promise.resolve({ total: 0, pending: 0, completed: 0 })),
    complete: vi.fn(),
    reopen: vi.fn(),
    remove: vi.fn(),
  },
}));

const sampleTasks = [
  { id: 1, title: 'Buy milk', description: 'From the corner shop', status: 'pending', created_at: '2026-10-01T10:00:00Z' },
  { id: 2, title: 'Write report', description: 'Include milk budget', status: 'pending', created_at: '2026-10-02T10:00:00Z' },
  { id: 3, title: 'Call Mom', description: '', status: 'completed', created_at: '2026-10-03T10:00:00Z' },
];

const allTitles = sampleTasks.map((task) => task.title);

async function renderDashboard() {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
  await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull());
}

async function renderWithTasks() {
  tasksApi.list.mockResolvedValueOnce(sampleTasks);
  await renderDashboard();
}

function searchBox() {
  return screen.getByRole('searchbox', { name: 'Search tasks by title' });
}

function search(text) {
  fireEvent.change(searchBox(), { target: { value: text } });
}

function expectVisibleTitles(expected) {
  for (const title of allTitles) {
    if (expected.includes(title)) {
      expect(screen.getByText(title)).toBeTruthy();
    } else {
      expect(screen.queryByText(title)).toBeNull();
    }
  }
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

  it('clicking Reopen on a completed task calls tasksApi.reopen and reloads the list', async () => {
    tasksApi.reopen.mockResolvedValueOnce({ ...sampleTasks[2], status: 'pending' });
    await renderWithTasks();
    const listCalls = tasksApi.list.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
    expect(tasksApi.reopen).toHaveBeenCalledWith(3);
    await waitFor(() => expect(tasksApi.list.mock.calls.length).toBe(listCalls + 1));
  });
});

describe('Dashboard task search', () => {
  afterEach(cleanup);

  it('shows a search box labelled "Search tasks by title" above the task table', async () => {
    await renderWithTasks();
    const table = screen.getByRole('table');
    expect(searchBox().compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows all tasks when the search box is empty', async () => {
    await renderWithTasks();
    expect(searchBox().value).toBe('');
    expectVisibleTitles(allTitles);
  });

  it('filters tasks by title as the user types', async () => {
    await renderWithTasks();
    search('rep');
    expectVisibleTitles(['Write report']);
  });

  it('matches titles case-insensitively', async () => {
    await renderWithTasks();
    search('BUY');
    expectVisibleTitles(['Buy milk']);
    search('mOm');
    expectVisibleTitles(['Call Mom']);
  });

  it('ignores surrounding whitespace in the search text', async () => {
    await renderWithTasks();
    search('  milk  ');
    expectVisibleTitles(['Buy milk']);
  });

  it('matches on title only, not description', async () => {
    await renderWithTasks();
    search('milk');
    expectVisibleTitles(['Buy milk']);
  });

  it('shows "No tasks match your search." when nothing matches', async () => {
    await renderWithTasks();
    search('zzz');
    expect(screen.getByText('No tasks match your search.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expectVisibleTitles([]);
  });

  it('shows all tasks again when the search is cleared', async () => {
    await renderWithTasks();
    search('zzz');
    search('');
    expect(screen.queryByText('No tasks match your search.')).toBeNull();
    expectVisibleTitles(allTitles);
  });

  it('hides the search box when there are no tasks', async () => {
    await renderDashboard();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.getByText(/No tasks yet/)).toBeTruthy();
  });
});
