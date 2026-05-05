export const RISK_STYLES = {
  LOW: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  HIGH: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  CRITICAL: 'bg-red-500/15 text-red-300 border border-red-500/30',
  null: 'bg-ink-700/50 text-ink-400 border border-ink-700',
  undefined: 'bg-ink-700/50 text-ink-400 border border-ink-700',
};

export const RISK_DOT = {
  LOW: 'bg-emerald-400',
  MEDIUM: 'bg-amber-400',
  HIGH: 'bg-orange-400',
  CRITICAL: 'bg-red-400',
};

export function RiskBadge({ level, score }) {
  const cls = RISK_STYLES[level] || RISK_STYLES.null;
  return (
    <span className={`badge ${cls}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1 ${RISK_DOT[level] || 'bg-ink-500'}`}
      />
      {level || 'UNRATED'}
      {score != null && <span className="ml-1 opacity-70">{(score * 100).toFixed(0)}%</span>}
    </span>
  );
}

export function formatCurrency(n) {
  if (n == null) return '-';
  return `$${Number(n).toFixed(2)}`;
}

export function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
