function countPhrase(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function verb(count, { one, many }) {
  return count === 1 ? one : many;
}

function summarize(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const [completed, pending, deleted] = items;
  return (
    `Out of ${countPhrase(total, 'task')}, ` +
    `${completed.value} ${verb(completed.value, { one: 'is', many: 'are' })} completed (${completed.percent}%), ` +
    `${pending.value} ${verb(pending.value, { one: 'is', many: 'are' })} pending (${pending.percent}%) and ` +
    `${deleted.value} ${verb(deleted.value, { one: 'was', many: 'were' })} deleted (${deleted.percent}%).`
  );
}

export default function BreakdownChart({ items }) {
  const max = Math.max(0, ...items.map((item) => item.value));

  return (
    <figure className="chart">
      <ul className="chart-bars">
        {items.map(({ key, label, value, percent }) => (
          <li key={key} className="chart-item">
            <span className="visually-hidden">{`${label}: ${countPhrase(value, 'task')}, ${percent}%`}</span>
            <span className="chart-value" aria-hidden="true">
              {value} · {percent}%
            </span>
            <div className="chart-plot" aria-hidden="true">
              <div
                className={`chart-bar chart-bar-${key}`}
                data-testid={`bar-${key}`}
                style={{ '--bar-size': max === 0 ? 0 : value / max }}
              />
            </div>
            <span className="chart-label" aria-hidden="true">
              {label}
            </span>
          </li>
        ))}
      </ul>
      <figcaption className="chart-summary" aria-live="polite">
        {summarize(items)}
      </figcaption>
    </figure>
  );
}
