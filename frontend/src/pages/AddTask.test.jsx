import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tasksApi } from '../api/tasks.js';
import AddTask from './AddTask.jsx';

vi.mock('../api/tasks.js', () => ({
  tasksApi: {
    create: vi.fn(() => Promise.resolve({ id: 1 })),
  },
}));

function renderAddTask() {
  render(
    <MemoryRouter>
      <AddTask />
    </MemoryRouter>,
  );
}

function prioritySelect() {
  return screen.getByRole('combobox', { name: 'Priority' });
}

function fillTitle(text) {
  fireEvent.change(screen.getByLabelText(/Title/), { target: { value: text } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));
}

describe('AddTask priority', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a Priority dropdown with Low, Medium and High', () => {
    renderAddTask();
    const options = [...prioritySelect().options].map((option) => [option.value, option.textContent]);
    expect(options).toEqual([
      ['low', 'Low'],
      ['medium', 'Medium'],
      ['high', 'High'],
    ]);
  });

  it('Priority defaults to Medium', () => {
    renderAddTask();
    expect(prioritySelect().value).toBe('medium');
  });

  it('submits the chosen priority with the task', async () => {
    renderAddTask();
    fillTitle('Plan release');
    fireEvent.change(prioritySelect(), { target: { value: 'high' } });
    submit();
    await waitFor(() => expect(tasksApi.create).toHaveBeenCalledTimes(1));
    expect(tasksApi.create).toHaveBeenCalledWith({ title: 'Plan release', description: null, priority: 'high' });
  });

  it('submits medium when priority is left unchanged', async () => {
    renderAddTask();
    fillTitle('Plan release');
    submit();
    await waitFor(() => expect(tasksApi.create).toHaveBeenCalledTimes(1));
    expect(tasksApi.create.mock.calls[0][0].priority).toBe('medium');
  });

  it('shows the save error and keeps the form when create fails', async () => {
    tasksApi.create.mockRejectedValueOnce(new Error('permission denied'));
    renderAddTask();
    fillTitle('Plan release');
    fireEvent.change(prioritySelect(), { target: { value: 'low' } });
    submit();
    expect(await screen.findByText('permission denied')).toBeTruthy();
    expect(screen.getByLabelText(/Title/).value).toBe('Plan release');
    expect(prioritySelect().value).toBe('low');
    expect(prioritySelect().disabled).toBe(false);
  });
});
