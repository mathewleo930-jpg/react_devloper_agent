import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/tasks.js';
import { toBreakdown } from '../breakdown.js';
import BreakdownChart from '../components/BreakdownChart.jsx';
import StatCard from '../components/StatCard.jsx';

export default function Analytics() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // toBreakdown throws on a malformed row, so a bad row shows the error state, not a wrong chart.
      setItems(toBreakdown(await tasksApi.stats()));
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

  const isEmpty = items !== null && items.every((item) => item.value === 0);

  let content;
  if (loading) {
    content = <p className="empty">Loading your task breakdown…</p>;
  } else if (failed) {
    content = (
      <div className="alert alert-retry" role="alert">
        <p>We couldn't load your analytics right now. Check your connection and try again.</p>
        <button type="button" className="btn btn-retry" onClick={load}>
          Retry
        </button>
      </div>
    );
  } else if (isEmpty) {
    content = (
      <p className="empty">No tasks to chart yet. Add your first task and your progress will show up here.</p>
    );
  } else {
    content = <BreakdownChart items={items} />;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Analytics</h1>
        <Link to="/tasks/new" className="btn btn-add">+ Add Task</Link>
      </div>
      <p className="intro muted">How your tasks break down: done, still to do, and removed.</p>

      <div className="card">
        <h2>Task breakdown</h2>
        {content}
      </div>

      {!loading && !failed && !isEmpty && (
        <div className="stats stats-below">
          {items.map(({ key, label, value }) => (
            <StatCard key={key} label={label} value={value} variant={key} />
          ))}
        </div>
      )}
    </section>
  );
}
