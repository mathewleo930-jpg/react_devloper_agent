import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TaskNotFoundError, tasksApi } from '../api/tasks.js';
import DeletedTasks from './DeletedTasks.jsx';

vi.mock('../api/tasks.js', () => ({
  TaskNotFoundError: class TaskNotFoundError extends Error {},
  tasksApi: { listDeleted: vi.fn(), restore: vi.fn() },
}));

const milk = {
  id: 1,
  title: 'Buy milk',
  description: '',
  status: 'pending',
  created_at: '2026-10-01T10:00:00Z',
  deleted_at: '2026-10-05T09:30:00Z',
};
const report = {
  id: 2,
  title: 'Send report',
  description: 'Q3 numbers',
  status: 'completed',
  created_at: '2026-10-02T10:00:00Z',
  deleted_at: '2026-10-04T15:00:00Z',
};

function renderPage() {
  render(
    <MemoryRouter>
      <DeletedTasks />
    </MemoryRouter>,
  );
}

describe('DeletedTasks', () => {
  afterEach(() => {
    cleanup();
    vi.mocked(tasksApi.listDeleted).mockReset();
    vi.mocked(tasksApi.restore).mockReset();
  });

  it('shows a loading message first', () => {
    vi.mocked(tasksApi.listDeleted).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('heading', { name: 'Deleted tasks' })).toBeTruthy();
    expect(screen.getByText('Loading deleted tasks…')).toBeTruthy();
  });

  it('shows the empty-state message when there are no deleted tasks', async () => {
    vi.mocked(tasksApi.listDeleted).mockResolvedValue([]);
    renderPage();
    expect(
      await screen.findByText(
        'No deleted tasks. Tasks you delete from the Dashboard will appear here, so you can restore them.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to Dashboard' }).getAttribute('href')).toBe('/');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('lists deleted tasks with their deletion dates', async () => {
    vi.mocked(tasksApi.listDeleted).mockResolvedValue([milk, report]);
    renderPage();
    expect(await screen.findByText('Buy milk')).toBeTruthy();
    expect(screen.getByText('Send report')).toBeTruthy();
    expect(screen.getByText('2 deleted')).toBeTruthy();
    const times = document.querySelectorAll('time');
    expect([...times].map((time) => time.getAttribute('dateTime'))).toEqual([milk.deleted_at, report.deleted_at]);
  });

  it('restoring removes the task and announces it is back on the Dashboard', async () => {
    vi.mocked(tasksApi.listDeleted).mockResolvedValue([milk, report]);
    vi.mocked(tasksApi.restore).mockResolvedValue({ ...milk, deleted_at: null });
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Restore "Buy milk"' }));

    const status = screen.getByRole('status');
    await waitFor(() => expect(status.textContent).toContain('"Buy milk" is back on your Dashboard.'));
    expect(tasksApi.restore).toHaveBeenCalledWith(1);
    expect(screen.queryByText('Buy milk')).toBeNull();
    expect(screen.getByText('Send report')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View Dashboard' }).getAttribute('href')).toBe('/');
    expect(status.contains(document.activeElement)).toBe(true);
  });

  it('shows a friendly error and keeps the row when restore fails', async () => {
    vi.mocked(tasksApi.listDeleted).mockResolvedValue([milk]);
    vi.mocked(tasksApi.restore).mockRejectedValue(new Error('permission denied'));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Restore "Buy milk"' }));

    const status = screen.getByRole('status');
    await waitFor(() => expect(status.textContent).toContain("We couldn't restore that task. Please try again."));
    expect(status.textContent).not.toContain('permission denied');
    expect(screen.getByText('Buy milk')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restore "Buy milk"' }).disabled).toBe(false);
    expect(tasksApi.listDeleted).toHaveBeenCalledTimes(1);
  });

  it('shows an "already restored" message and reloads on TaskNotFoundError', async () => {
    vi.mocked(tasksApi.listDeleted).mockResolvedValueOnce([milk, report]).mockResolvedValueOnce([report]);
    vi.mocked(tasksApi.restore).mockRejectedValue(new TaskNotFoundError('Task 1 not found'));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Restore "Buy milk"' }));

    const status = screen.getByRole('status');
    await waitFor(() =>
      expect(status.textContent).toContain('That task was already restored or no longer exists.'),
    );
    await waitFor(() => expect(screen.queryByText('Buy milk')).toBeNull());
    expect(screen.getByText('Send report')).toBeTruthy();
    expect(tasksApi.listDeleted).toHaveBeenCalledTimes(2);
  });

  it('shows a retry alert when loading fails, and Retry reloads', async () => {
    vi.mocked(tasksApi.listDeleted)
      .mockRejectedValueOnce(new Error('FetchError: socket hang up'))
      .mockResolvedValueOnce([milk]);
    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(
      "We couldn't load your deleted tasks right now. Check your connection and try again.",
    );
    expect(alert.textContent).not.toContain('socket hang up');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Buy milk')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(tasksApi.listDeleted).toHaveBeenCalledTimes(2);
  });
});
