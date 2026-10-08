import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/tasks.js';
import StatCard from '../components/StatCard.jsx';
import TaskTable from '../components/TaskTable.jsx';

const RECENT_LIMIT = 20;

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [taskList, taskStats] = await Promise.all([tasksApi.list(RECENT_LIMIT), tasksApi.stats()]);
      setTasks(taskList);
      setStats(taskStats);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (id, action) => {
    setBusyId(id);
    try {
      await action();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = (id) => runAction(id, () => tasksApi.complete(id));

  const handleDelete = (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    runAction(task.id, () => tasksApi.remove(task.id));
  };

  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/tasks/new" className="btn btn-add">+ Add Task</Link>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="stats">
        <StatCard label="Total tasks" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} variant="pending" />
        <StatCard label="Completed" value={stats.completed} variant="completed" />
      </div>

      <div className="card">
        <h2>Recent tasks</h2>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : (
          <TaskTable tasks={tasks} busyId={busyId} onComplete={handleComplete} onDelete={handleDelete} />
        )}
      </div>
    </section>
  );
}
