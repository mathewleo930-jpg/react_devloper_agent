import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaskTable from './TaskTable.jsx';

const pendingTask = { id: 1, title: 'Buy milk', description: '', status: 'pending', created_at: '2026-10-01T10:00:00Z' };
const completedTask = { id: 3, title: 'Call Mom', description: '', status: 'completed', created_at: '2026-10-03T10:00:00Z' };

function renderTable({ tasks, busyId = null, onEdit = () => {}, onReopen = () => {} }) {
  render(
    <TaskTable
      tasks={tasks}
      busyId={busyId}
      onEdit={onEdit}
      onComplete={() => {}}
      onReopen={onReopen}
      onDelete={() => {}}
    />,
  );
}

describe('TaskTable', () => {
  afterEach(cleanup);

  it('shows a Reopen button for completed tasks and no Complete button', () => {
    renderTable({ tasks: [completedTask] });
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Complete' })).toBeNull();
  });

  it('shows a Complete button for pending tasks and no Reopen button', () => {
    renderTable({ tasks: [pendingTask] });
    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reopen' })).toBeNull();
  });

  it('clicking Reopen calls onReopen with the task id', () => {
    const onReopen = vi.fn();
    renderTable({ tasks: [completedTask], onReopen });
    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
    expect(onReopen).toHaveBeenCalledTimes(1);
    expect(onReopen).toHaveBeenCalledWith(3);
  });

  it('disables Reopen while the task is busy', () => {
    renderTable({ tasks: [completedTask], busyId: 3 });
    expect(screen.getByRole('button', { name: 'Reopen' }).disabled).toBe(true);
  });

  it('shows an Edit button for pending and completed tasks', () => {
    renderTable({ tasks: [pendingTask, completedTask] });
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('places Edit before the other row actions', () => {
    renderTable({ tasks: [pendingTask] });
    const labels = screen.getAllByRole('button').map((button) => button.textContent);
    expect(labels).toEqual(['Edit', 'Complete', 'Delete']);
  });

  it('clicking Edit calls onEdit with the task', () => {
    const onEdit = vi.fn();
    renderTable({ tasks: [completedTask], onEdit });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(completedTask);
  });

  it('disables Edit while the task is busy', () => {
    renderTable({ tasks: [pendingTask], busyId: 1 });
    expect(screen.getByRole('button', { name: 'Edit' }).disabled).toBe(true);
  });
});
