export default function StatCard({ label, value, variant = 'default' }) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
