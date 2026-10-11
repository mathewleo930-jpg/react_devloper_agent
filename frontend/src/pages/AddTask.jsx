import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TaskNotFoundError, tasksApi } from '../api/tasks.js';
import { DESCRIPTION_MAX, TITLE_MAX } from '../charLimit.js';
import CharCounter from '../components/CharCounter.jsx';
import { DEFAULT_PRIORITY, PRIORITIES } from '../priority.js';

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

function parseTaskId(id) {
  return /^\d+$/.test(id) && Number(id) > 0 ? Number(id) : null;
}

// Loads the task named in the URL; in add mode (no id) there is nothing to load.
// Status: 'loading' | 'ready' | 'notFound' | 'loadError'.
function useEditableTask(id, onLoaded) {
  const taskId = id === undefined ? null : parseTaskId(id);
  const [status, setStatus] = useState(() => {
    if (id === undefined) return 'ready';
    return taskId ? 'loading' : 'notFound';
  });
  const [attempt, setAttempt] = useState(0);
  // A ref keeps the latest callback without re-running the load when it changes.
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    if (!taskId) return undefined;
    let cancelled = false;
    setStatus('loading');
    tasksApi.get(taskId).then(
      (task) => {
        if (cancelled) return;
        onLoadedRef.current(task);
        setStatus('ready');
      },
      (err) => {
        if (!cancelled) setStatus(err instanceof TaskNotFoundError ? 'notFound' : 'loadError');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [taskId, attempt]);

  return { taskId, status, setStatus, retry: () => setAttempt((n) => n + 1) };
}

export default function AddTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = id !== undefined;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [titleError, setTitleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { taskId, status, setStatus, retry } = useEditableTask(id, (task) => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority ?? DEFAULT_PRIORITY);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const values = { title: title.trim(), description: description.trim() || null, priority };
    try {
      if (editing) {
        await tasksApi.update(taskId, values);
      } else {
        await tasksApi.create(values);
      }
      navigate('/');
    } catch (err) {
      setSubmitting(false);
      if (err instanceof TaskNotFoundError) {
        setStatus('notFound');
      } else {
        setSubmitError(err.message);
      }
    }
  };

  const backButton = (
    <button type="button" className="btn btn-retry" onClick={() => navigate('/')}>
      Back to dashboard
    </button>
  );

  let content;
  if (status === 'loading') {
    content = (
      <div className="card">
        <p className="empty" role="status">Loading task…</p>
      </div>
    );
  } else if (status === 'notFound') {
    content = (
      <div className="card">
        <div className="alert" role="alert">
          This task has been deleted or no longer exists, so it can't be edited.
        </div>
        <div className="form-actions">{backButton}</div>
      </div>
    );
  } else if (status === 'loadError') {
    content = (
      <div className="card">
        <div className="alert" role="alert">
          We couldn't load this task. Check your connection and try again.
        </div>
        <div className="form-actions">
          {backButton}
          <button type="button" className="btn btn-primary btn-retry" onClick={retry}>
            Try again
          </button>
        </div>
      </div>
    );
  } else {
    content = (
      <form className="card form" onSubmit={handleSubmit} noValidate>
        {submitError && (
          <div className="alert" role="alert">
            {submitError}
          </div>
        )}

        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          autoFocus
          placeholder="e.g. Prepare sprint review"
          aria-describedby="title-count"
          className={titleError ? 'invalid' : ''}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
        />
        <div className="field-meta">
          {titleError && <p className="field-error">{titleError}</p>}
          <CharCounter id="title-count" length={title.length} max={TITLE_MAX} />
        </div>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          maxLength={DESCRIPTION_MAX}
          placeholder="Optional details"
          aria-describedby="description-count"
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="field-meta">
          <CharCounter id="description-count" length={description.length} max={DESCRIPTION_MAX} />
        </div>

        <label htmlFor="priority">Priority</label>
        <select id="priority" value={priority} disabled={submitting} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((level) => (
            <option key={level} value={level}>
              {capitalize(level)}
            </option>
          ))}
        </select>

        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate('/')} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="narrow">
      <div className="page-header">
        <h1>{editing ? 'Edit Task' : 'Add Task'}</h1>
      </div>
      {content}
    </section>
  );
}
