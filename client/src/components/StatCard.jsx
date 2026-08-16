export default function StatCard({ value, label, note }) {
  return <div className="stat-card"><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div>;
}
