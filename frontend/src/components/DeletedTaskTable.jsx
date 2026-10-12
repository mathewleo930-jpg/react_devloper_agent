const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function DeletedTaskTable({ tasks, busyId, onRestore }) {
  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Deleted</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const busy = busyId === task.id;
            return (
              <tr key={task.id}>
                <td className="title-cell">{task.title}</td>
                <td className="muted">{task.description || '—'}</td>
                <td>
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                </td>
                <td className="muted nowrap">
                  <time dateTime={task.deleted_at}>{dateFormatter.format(new Date(task.deleted_at))}</time>
                </td>
                <td className="actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    aria-label={`Restore "${task.title}"`}
                    disabled={busy}
                    onClick={() => onRestore(task)}
                  >
                    {busy ? 'Restoring…' : 'Restore'}
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
