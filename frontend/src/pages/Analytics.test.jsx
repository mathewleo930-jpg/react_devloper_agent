import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tasksApi } from '../api/tasks.js';
import Analytics from './Analytics.jsx';

vi.mock('../api/tasks.js', () => ({
  tasksApi: { stats: vi.fn() },
}));

function renderAnalytics() {
  render(
    <MemoryRouter>
      <Analytics />
    </MemoryRouter>,
  );
}

describe('Analytics', () => {
  afterEach(() => {
    cleanup();
    vi.mocked(tasksApi.stats).mockReset();
  });

  it('shows a loading message while stats load', () => {
    vi.mocked(tasksApi.stats).mockReturnValue(new Promise(() => {}));
    renderAnalytics();
    expect(screen.getByText('Loading your task breakdown…')).toBeTruthy();
  });

  it('renders the chart and stat cards on success', async () => {
    vi.mocked(tasksApi.stats).mockResolvedValue({ total: 8, pending: 5, completed: 3, deleted: 2 });
    renderAnalytics();
    expect(
      await screen.findByText(
        'Out of 10 tasks, 3 are completed (30%), 5 are pending (50%) and 2 were deleted (20%).',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Task breakdown' })).toBeTruthy();
    const cards = document.querySelectorAll('.stat-card');
    expect([...cards].map((card) => card.textContent)).toEqual(['Completed3', 'Pending5', 'Deleted2']);
    expect(cards[2].classList.contains('stat-deleted')).toBe(true);
  });

  it('shows the empty state with an Add Task link when there are no tasks', async () => {
    vi.mocked(tasksApi.stats).mockResolvedValue({ total: 0, pending: 0, completed: 0, deleted: 0 });
    renderAnalytics();
    expect(
      await screen.findByText(
        'No tasks to chart yet. Add your first task and your progress will show up here.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: '+ Add Task' }).getAttribute('href')).toBe('/tasks/new');
    expect(screen.queryByRole('figure')).toBeNull();
  });

  it('shows a friendly error and reloads on Retry', async () => {
    vi.mocked(tasksApi.stats)
      .mockRejectedValueOnce(new Error('FetchError: socket hang up'))
      .mockResolvedValueOnce({ total: 1, pending: 0, completed: 1, deleted: 0 });
    renderAnalytics();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(
      "We couldn't load your analytics right now. Check your connection and try again.",
    );
    expect(alert.textContent).not.toContain('socket hang up');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(/^Out of 1 task, 1 is completed \(100%\)/)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(tasksApi.stats).toHaveBeenCalledTimes(2);
  });
});
