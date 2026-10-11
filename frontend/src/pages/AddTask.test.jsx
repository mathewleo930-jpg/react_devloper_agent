import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TaskNotFoundError, tasksApi } from '../api/tasks.js';
import AddTask from './AddTask.jsx';

vi.mock('../api/tasks.js', () => ({
  TaskNotFoundError: class TaskNotFoundError extends Error {},
  tasksApi: {
    create: vi.fn(() => Promise.resolve({ id: 1 })),
    get: vi.fn(),
    update: vi.fn(() => Promise.resolve({ id: 5 })),
  },
}));

const savedTask = {
  id: 5,
  title: 'Plan release',
  description: 'Draft the notes',
  status: 'pending',
  priority: 'high',
  created_at: '2026-10-01T10:00:00Z',
  deleted_at: null,
};

function renderAddTask() {
  render(
    <MemoryRouter>
      <AddTask />
    </MemoryRouter>,
  );
}

function renderEditTask(path = '/tasks/5/edit') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<p>Dashboard page</p>} />
        <Route path="/tasks/:id/edit" element={<AddTask />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function renderLoadedEditTask(task = savedTask) {
  tasksApi.get.mockResolvedValueOnce(task);
  renderEditTask();
  await screen.findByRole('button', { name: 'Save Changes' });
}

const deletedMessage = "This task has been deleted or no longer exists, so it can't be edited.";

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

describe('AddTask edit mode', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('add mode does not load a task', () => {
    renderAddTask();
    expect(tasksApi.get).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Add Task' })).toBeTruthy();
  });

  it('edit mode shows a loading message then the form pre-filled with title, description and priority', async () => {
    tasksApi.get.mockResolvedValueOnce(savedTask);
    renderEditTask();
    expect(screen.getByRole('status').textContent).toBe('Loading task…');
    await screen.findByRole('button', { name: 'Save Changes' });
    expect(tasksApi.get).toHaveBeenCalledTimes(1);
    expect(tasksApi.get).toHaveBeenCalledWith(5);
    expect(screen.getByLabelText(/Title/).value).toBe('Plan release');
    expect(screen.getByLabelText('Description').value).toBe('Draft the notes');
    expect(prioritySelect().value).toBe('high');
  });

  it('pre-fills a blank description and medium priority when the task has none', async () => {
    await renderLoadedEditTask({ ...savedTask, description: null, priority: null });
    expect(screen.getByLabelText('Description').value).toBe('');
    expect(prioritySelect().value).toBe('medium');
  });

  it('edit mode shows Edit Task heading and Save Changes button', async () => {
    await renderLoadedEditTask();
    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Create Task' })).toBeNull();
  });

  it('focuses the title field once the task has loaded', async () => {
    await renderLoadedEditTask();
    expect(document.activeElement).toBe(screen.getByLabelText(/Title/));
  });

  it('saving calls update with the edited values and returns to the dashboard', async () => {
    await renderLoadedEditTask();
    fillTitle('  Plan the release ');
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '   ' } });
    fireEvent.change(prioritySelect(), { target: { value: 'low' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Dashboard page')).toBeTruthy();
    expect(tasksApi.update).toHaveBeenCalledWith(5, { title: 'Plan the release', description: null, priority: 'low' });
    expect(tasksApi.create).not.toHaveBeenCalled();
  });

  it('shows Saving… while the update is in progress', async () => {
    tasksApi.update.mockReturnValueOnce(new Promise(() => {}));
    await renderLoadedEditTask();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeTruthy();
  });

  it('edit mode blocks a blank title without calling update', async () => {
    await renderLoadedEditTask();
    fillTitle('   ');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByText('Title is required')).toBeTruthy();
    expect(tasksApi.update).not.toHaveBeenCalled();
  });

  it('shows the deleted-task message and no form when the task is deleted', async () => {
    tasksApi.get.mockRejectedValueOnce(new TaskNotFoundError('Task 5 not found'));
    renderEditTask();
    expect((await screen.findByRole('alert')).textContent).toBe(deletedMessage);
    expect(screen.queryByLabelText(/Title/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back to dashboard' }));
    expect(screen.getByText('Dashboard page')).toBeTruthy();
  });

  it('shows the deleted-task message when the task is deleted before saving', async () => {
    tasksApi.update.mockRejectedValueOnce(new TaskNotFoundError('Task 5 not found'));
    await renderLoadedEditTask();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect((await screen.findByRole('alert')).textContent).toBe(deletedMessage);
    expect(screen.queryByLabelText(/Title/)).toBeNull();
  });

  it('shows other save errors and keeps the edited form', async () => {
    tasksApi.update.mockRejectedValueOnce(new Error('permission denied'));
    await renderLoadedEditTask();
    fillTitle('Plan the release');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect((await screen.findByRole('alert')).textContent).toBe('permission denied');
    expect(screen.getByLabelText(/Title/).value).toBe('Plan the release');
    expect(screen.getByRole('button', { name: 'Save Changes' }).disabled).toBe(false);
  });

  it('shows a friendly load error with a way back when loading fails', async () => {
    tasksApi.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderEditTask();
    expect((await screen.findByRole('alert')).textContent).toBe(
      "We couldn't load this task. Check your connection and try again.",
    );
    expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeTruthy();
    expect(screen.queryByLabelText(/Title/)).toBeNull();
  });

  it('Try again reloads the task after a load error', async () => {
    tasksApi.get.mockRejectedValueOnce(new Error('Failed to fetch')).mockResolvedValueOnce(savedTask);
    renderEditTask();
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    await screen.findByRole('button', { name: 'Save Changes' });
    expect(tasksApi.get).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText(/Title/).value).toBe('Plan release');
  });

  it('an invalid id shows the deleted-task message without calling the API', () => {
    for (const path of ['/tasks/abc/edit', '/tasks/0/edit', '/tasks/1.5/edit']) {
      renderEditTask(path);
      expect(screen.getByRole('alert').textContent).toBe(deletedMessage);
      cleanup();
    }
    expect(tasksApi.get).not.toHaveBeenCalled();
  });
});

describe('AddTask character counters', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const titleCount = () => document.getElementById('title-count');
  const descriptionCount = () => document.getElementById('description-count');
  const fillDescription = (text) =>
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: text } });

  it('shows 0 / 200 under the title and 0 / 2000 under the description on an empty form', () => {
    renderAddTask();
    expect(titleCount().textContent).toBe('0 / 200');
    expect(descriptionCount().textContent).toBe('0 / 2000');
  });

  it('title counter updates live as the user types', () => {
    renderAddTask();
    fillTitle('Plan release');
    expect(titleCount().textContent).toBe('12 / 200');
  });

  it('description counter updates live', () => {
    renderAddTask();
    fillDescription('a'.repeat(120));
    expect(descriptionCount().textContent).toBe('120 / 2000');
  });

  it('title counter turns red at 180 characters but not at 179', () => {
    renderAddTask();
    fillTitle('a'.repeat(179));
    expect(titleCount().classList.contains('char-count-near')).toBe(false);
    expect(titleCount().textContent).toBe('179 / 200');
    fillTitle('a'.repeat(180));
    expect(titleCount().classList.contains('char-count-near')).toBe(true);
    expect(titleCount().textContent).toBe('180 / 200 · 20 left');
  });

  it('description counter turns red at 1800 characters', () => {
    renderAddTask();
    fillDescription('a'.repeat(1799));
    expect(descriptionCount().classList.contains('char-count-near')).toBe(false);
    fillDescription('a'.repeat(1800));
    expect(descriptionCount().classList.contains('char-count-near')).toBe(true);
    expect(descriptionCount().textContent).toBe('1800 / 2000 · 200 left');
  });

  it('inputs are linked to their counters with aria-describedby', () => {
    renderAddTask();
    expect(screen.getByLabelText(/Title/).getAttribute('aria-describedby')).toBe('title-count');
    expect(screen.getByLabelText('Description').getAttribute('aria-describedby')).toBe('description-count');
  });

  it("edit mode counters show the loaded task's lengths", async () => {
    await renderLoadedEditTask();
    expect(titleCount().textContent).toBe('12 / 200');
    expect(descriptionCount().textContent).toBe('15 / 2000');
  });

  it('title error and counter are both shown under the title', () => {
    renderAddTask();
    submit();
    const error = screen.getByText('Title is required');
    expect(error.parentElement).toBe(titleCount().parentElement);
    expect(error.parentElement.className).toBe('field-meta');
    expect(titleCount().textContent).toBe('0 / 200');
  });

  it('inputs keep maxLength 200 and 2000', () => {
    renderAddTask();
    expect(screen.getByLabelText(/Title/).maxLength).toBe(200);
    expect(screen.getByLabelText('Description').maxLength).toBe(2000);
  });
});
