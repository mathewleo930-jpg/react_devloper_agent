// Single-series charts: one hue, values labelled directly, hover/focus tooltip per mark.

export function BarList({ items, unit = 'tickets', label }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <figure className="barlist" aria-label={label}>
      <ul>
        {items.map((item) => (
          <li key={item.label} className="barlist-row" tabIndex={0} data-tip={`${item.label}: ${item.value} ${unit}`}>
            <span className="barlist-label">{item.label}</span>
            <span className="barlist-track">
              <span className="barlist-fill" style={{ width: `${(item.value / max) * 100}%` }} />
            </span>
            <span className="barlist-value">{item.value}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function ColumnChart({ items, unit = 'tickets', label }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const peak = items.reduce((best, i) => (i.value > best.value ? i : best), items[0]);
  return (
    <figure className="columns" aria-label={label}>
      <div className="columns-plot">
        {[1, 0.5, 0].map((f) => (
          <span key={f} className="columns-grid" style={{ bottom: `${f * 100}%` }}>
            <span>{Math.round(max * f)}</span>
          </span>
        ))}
        {items.map((item) => (
          <div
            key={item.label}
            className="columns-col"
            tabIndex={0}
            data-tip={`${item.label}: ${item.value} ${unit}`}
          >
            {item === peak && item.value > 0 && <span className="columns-peak">{item.value}</span>}
            <span className="columns-bar" style={{ height: `${(item.value / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="columns-axis" aria-hidden="true">
        {items.map((item) => (
          <span key={item.label}>{item.short ?? item.label}</span>
        ))}
      </div>
      <table className="visually-hidden">
        <caption>{label}</caption>
        <tbody>
          {items.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function StatTile({ label, value, hint, icon, tone = 'default' }) {
  return (
    <div className={`stat-tile stat-tone-${tone}`}>
      <div className="stat-tile-head">
        <span className="stat-tile-label">{label}</span>
        {icon && <span className="stat-tile-icon">{icon}</span>}
      </div>
      <div className="stat-tile-value">{value}</div>
      {hint && <div className="stat-tile-hint">{hint}</div>}
    </div>
  );
}
