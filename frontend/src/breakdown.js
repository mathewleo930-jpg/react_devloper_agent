export const BREAKDOWN_STATES = [
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'deleted', label: 'Deleted' },
];

function assertCount(key, value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`Invalid task count for ${key}: ${value}`);
  }
}

export function toBreakdown(stats) {
  if (stats === null || typeof stats !== 'object') {
    throw new TypeError(`Invalid task stats: ${stats}`);
  }
  for (const { key } of BREAKDOWN_STATES) assertCount(key, stats[key]);

  const sum = BREAKDOWN_STATES.reduce((acc, { key }) => acc + stats[key], 0);
  return BREAKDOWN_STATES.map(({ key, label }) => ({
    key,
    label,
    value: stats[key],
    percent: sum === 0 ? 0 : Math.round((stats[key] / sum) * 100),
  }));
}
