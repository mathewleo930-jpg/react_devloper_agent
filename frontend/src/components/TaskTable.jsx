const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function TaskTable({ tasks, busyId, onComplete, onReopen, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks yet. Click “Add Task” to create your first one.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const busy = busyId === task.id;
            const done = task.status === 'completed';
            return (
              <tr key={task.id} className={done ? 'row-done' : ''}>
                <td className="muted">#{task.id}</td>
                <td className="title-cell">{task.title}</td>
                <td className="muted">{task.description || '—'}</td>
                <td>
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                </td>
                <td className="muted nowrap">{dateFormatter.format(new Date(task.created_at))}</td>
                <td className="actions">
                  {done ? (
                    <button className="btn btn-sm" disabled={busy} onClick={() => onReopen(task.id)}>
                      Reopen
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-success" disabled={busy} onClick={() => onComplete(task.id)}>
                      Complete
                    </button>
                  )}
                  <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => onDelete(task)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
