import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskNotFoundError, tasksApi } from '../api/tasks.js';
import DeletedTaskTable from '../components/DeletedTaskTable.jsx';

export default function DeletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const noticeRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await tasksApi.listDeleted());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The restored row (and its focused button) disappears, so move focus to the outcome instead.
  useEffect(() => {
    if (message || actionError) noticeRef.current?.focus();
  }, [message, actionError]);

  const handleRestore = async (task) => {
    setBusyId(task.id);
    setMessage('');
    setActionError('');
    try {
      await tasksApi.restore(task.id);
      setTasks((current) => current.filter((t) => t.id !== task.id));
      setMessage(`"${task.title}" is back on your Dashboard.`);
    } catch (e) {
      if (e instanceof TaskNotFoundError) {
        setActionError('That task was already restored or no longer exists.');
        await load();
      } else {
        setActionError("We couldn't restore that task. Please try again.");
      }
    } finally {
      setBusyId(null);
    }
  };

  let content;
  if (loading) {
    content = <p className="empty">Loading deleted tasks…</p>;
  } else if (failed) {
    content = (
      <div className="alert alert-retry" role="alert">
        <p>We couldn't load your deleted tasks right now. Check your connection and try again.</p>
        <button type="button" className="btn btn-retry" onClick={load}>
          Retry
        </button>
      </div>
    );
  } else if (tasks.length === 0) {
    content = (
      <div className="empty-state">
        <p className="empty">
          No deleted tasks. Tasks you delete from the Dashboard will appear here, so you can restore them.
        </p>
        <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  } else {
    content = <DeletedTaskTable tasks={tasks} busyId={busyId} onRestore={handleRestore} />;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Deleted tasks</h1>
      </div>
      <p className="intro muted">Tasks you've deleted. Restore one to put it back on your Dashboard.</p>

      <div role="status">
        {message && (
          <div ref={noticeRef} tabIndex={-1} className="alert alert-success">
            <p>
              <span aria-hidden="true">✓ </span>
              {message}
            </p>
            <Link to="/">View Dashboard</Link>
          </div>
        )}
        {actionError && (
          <div ref={noticeRef} tabIndex={-1} className="alert">
            {actionError}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-heading">
          Recently deleted
          {!loading && !failed && tasks.length > 0 && <span className="task-count">{tasks.length} deleted</span>}
        </h2>
        {content}
      </div>
    </section>
  );
}
