import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DeletedTaskTable from './DeletedTaskTable.jsx';

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

const expectedDate = (iso) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

function renderTable({ tasks = [milk, report], busyId = null, onRestore = () => {} } = {}) {
  render(<DeletedTaskTable tasks={tasks} busyId={busyId} onRestore={onRestore} />);
}

describe('DeletedTaskTable', () => {
  afterEach(cleanup);

  it("shows each task's title and formatted deletion date", () => {
    renderTable();
    expect(screen.getByText('Buy milk')).toBeTruthy();
    expect(screen.getByText('Send report')).toBeTruthy();
    const times = document.querySelectorAll('time');
    expect([...times].map((time) => time.getAttribute('dateTime'))).toEqual([milk.deleted_at, report.deleted_at]);
    expect(times[0].textContent).toBe(expectedDate(milk.deleted_at));
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Title',
      'Description',
      'Status',
      'Deleted',
      'Actions',
    ]);
  });

  it('Restore button calls onRestore with the task', () => {
    const onRestore = vi.fn();
    renderTable({ onRestore });
    fireEvent.click(screen.getByRole('button', { name: 'Restore "Send report"' }));
    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(onRestore).toHaveBeenCalledWith(report);
  });

  it('Restore button is disabled while that task is busy', () => {
    renderTable({ busyId: 1 });
    const busyButton = screen.getByRole('button', { name: 'Restore "Buy milk"' });
    expect(busyButton.disabled).toBe(true);
    expect(busyButton.textContent).toBe('Restoring…');
    expect(screen.getByRole('button', { name: 'Restore "Send report"' }).disabled).toBe(false);
  });
});
