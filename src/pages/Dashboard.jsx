import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import {
  Users, AlertTriangle, TrendingDown, DollarSign,
  ArrowUpRight, RefreshCw, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../lib/api';
import { RiskBadge, formatCurrency, formatDate } from '../lib/format';

const RISK_COLORS = {
  LOW: '#34d399',
  MEDIUM: '#fbbf24',
  HIGH: '#fb923c',
  CRITICAL: '#f87171',
  UNKNOWN: '#637490',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [bins, setBins] = useState(null);
  const [mlHealth, setMlHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [summary, dist, ml] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/risk-distribution'),
        api.get('/predictions/health').catch(() => ({ data: { ok: false } })),
      ]);
      setData(summary.data);
      setBins(dist.data.bins);
      setMlHealth(ml.data);
    } catch (err) {
      toast.error('Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-ink-400 text-sm">Memuat data dashboard...</div>
    );
  }

  const riskData = Object.entries(data.byRisk)
    .filter(([k, v]) => v > 0)
    .map(([level, count]) => ({ level, count, fill: RISK_COLORS[level] }));

  const stats = [
    {
      label: 'Total Customers',
      value: data.totalCustomers.toLocaleString(),
      icon: Users,
      hint: `${data.retained} retained`,
    },
    {
      label: 'Churn Rate',
      value: `${data.churnRate}%`,
      icon: TrendingDown,
      hint: `${data.churned} churned`,
      tone: data.churnRate > 25 ? 'danger' : 'normal',
    },
    {
      label: 'Avg Risk Score',
      value: data.avgRiskScore.toFixed(2),
      icon: AlertTriangle,
      hint: `${data.byRisk.CRITICAL || 0} critical`,
      tone: data.avgRiskScore > 0.5 ? 'danger' : 'normal',
    },
    {
      label: 'Avg Monthly',
      value: formatCurrency(data.avgMonthlyCharges),
      icon: DollarSign,
      hint: `tenure ${data.avgTenure} mo`,
    },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="label-mono mb-1">// retentio / overview</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-ink-400 px-2 py-1 border border-ink-800 rounded">
            <Activity className={`w-3 h-3 ${mlHealth?.ok ? 'text-emerald-400' : 'text-red-400'}`} />
            ML API: {mlHealth?.ok ? 'online' : 'offline'}
          </div>
          <button onClick={load} className="btn">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="panel p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="label-mono">{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 ${
                  s.tone === 'danger' ? 'text-red-400' : 'text-ink-500'
                }`} />
              </div>
              <div className={`stat-value mb-1 ${s.tone === 'danger' ? 'text-red-300' : ''}`}>
                {s.value}
              </div>
              <div className="text-xs text-ink-500">{s.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Risk distribution histogram */}
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <div className="label-mono">[01]</div>
              <div className="text-sm font-medium">Churn Risk Distribution</div>
            </div>
            <span className="text-xs text-ink-500">10 bins · 0.0 → 1.0</span>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#373f51" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fill: '#8493aa', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#373f51' }}
                />
                <YAxis
                  tick={{ fill: '#8493aa', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#373f51' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1f2533',
                    border: '1px solid #373f51',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00d4a8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk pie */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="label-mono">[02]</div>
              <div className="text-sm font-medium">By Risk Level</div>
            </div>
          </div>
          <div className="p-4 h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="count"
                  nameKey="level"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1f2533',
                    border: '1px solid #373f51',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-xs">
            {riskData.map((r) => (
              <div key={r.level} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ background: r.fill }}
                />
                <span className="text-ink-400">{r.level}</span>
                <span className="ml-auto tabular-nums">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract distribution + recent customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="label-mono">[03]</div>
              <div className="text-sm font-medium">By Contract Type</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {data.byContract.map((c) => {
              const pct = data.totalCustomers > 0 ? (c.count / data.totalCustomers) * 100 : 0;
              return (
                <div key={c.contract}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-300">{c.contract}</span>
                    <span className="tabular-nums text-ink-400">
                      {c.count} <span className="text-ink-600">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-ink-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <div className="label-mono">[04]</div>
              <div className="text-sm font-medium">Recent Customers</div>
            </div>
            <Link to="/customers" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-ink-500 border-b border-ink-800">
                  <th className="px-4 py-2 label-mono font-normal">Code</th>
                  <th className="px-4 py-2 label-mono font-normal">Risk</th>
                  <th className="px-4 py-2 label-mono font-normal">Contract</th>
                  <th className="px-4 py-2 label-mono font-normal text-right">Monthly</th>
                  <th className="px-4 py-2 label-mono font-normal">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCustomers.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-4 py-2">
                      <Link to={`/customers/${c.id}`} className="text-accent hover:underline font-mono">
                        {c.customerCode}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <RiskBadge level={c.riskLevel} score={c.churnRiskScore} />
                    </td>
                    <td className="px-4 py-2 text-ink-300">{c.contract}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatCurrency(c.monthlyCharges)}
                    </td>
                    <td className="px-4 py-2 text-ink-500">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
