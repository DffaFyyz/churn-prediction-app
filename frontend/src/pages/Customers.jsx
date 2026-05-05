import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Plus, Download, ArrowUpDown, RefreshCw, Filter,
  ChevronLeft, ChevronRight, X, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../lib/api';
import { RiskBadge, formatCurrency } from '../lib/format';

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CONTRACTS = ['Month-to-month', 'One year', 'Two year'];
const INTERNETS = ['DSL', 'Fiber optic', 'No'];

export default function Customers() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    riskLevel: [],
    contract: '',
    internetService: '',
    isChurned: '',
    minTenure: '',
    maxTenure: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const queryParams = useMemo(() => {
    const params = { page, pageSize, sortBy, sortOrder };
    if (filters.search) params.search = filters.search;
    if (filters.riskLevel.length) params.riskLevel = filters.riskLevel.join(',');
    if (filters.contract) params.contract = filters.contract;
    if (filters.internetService) params.internetService = filters.internetService;
    if (filters.isChurned !== '') params.isChurned = filters.isChurned;
    if (filters.minTenure) params.minTenure = filters.minTenure;
    if (filters.maxTenure) params.maxTenure = filters.maxTenure;
    return params;
  }, [filters, page, pageSize, sortBy, sortOrder]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: queryParams });
      setData(data);
    } catch {
      toast.error('Gagal memuat customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [queryParams]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleRiskFilter = (level) => {
    setFilters((f) => ({
      ...f,
      riskLevel: f.riskLevel.includes(level)
        ? f.riskLevel.filter((l) => l !== level)
        : [...f.riskLevel, level],
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '', riskLevel: [], contract: '', internetService: '',
      isChurned: '', minTenure: '', maxTenure: '',
    });
    setPage(1);
  };

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.riskLevel.length +
    (filters.contract ? 1 : 0) +
    (filters.internetService ? 1 : 0) +
    (filters.isChurned !== '' ? 1 : 0) +
    (filters.minTenure ? 1 : 0) +
    (filters.maxTenure ? 1 : 0);

  const exportCsv = async () => {
    try {
      const params = { ...queryParams };
      delete params.page;
      delete params.pageSize;
      const res = await api.get('/customers/export', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV ter-download');
    } catch {
      toast.error('Gagal export CSV');
    }
  };

  const deleteCustomer = async (id, code) => {
    if (!confirm(`Hapus customer ${code}?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer dihapus');
      load();
    } catch {
      toast.error('Gagal hapus');
    }
  };

  const SortHeader = ({ field, label, align = 'left' }) => (
    <th className={`px-3 py-2 label-mono font-normal cursor-pointer select-none hover:text-ink-200 text-${align}`}
      onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortBy === field ? 'text-accent' : 'text-ink-600'}`} />
      </span>
    </th>
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="label-mono mb-1">// retentio / customers</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-xs text-ink-500 mt-1 tabular-nums">
            {data.pagination.total} total · page {data.pagination.page} of {data.pagination.totalPages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn">
            <Filter className="w-3 h-3" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1 rounded bg-accent text-ink-950 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button onClick={load} className="btn"><RefreshCw className="w-3 h-3" /></button>
          <button onClick={exportCsv} className="btn"><Download className="w-3 h-3" /> CSV</button>
          <button
            onClick={() => navigate('/customers/new')}
            className="btn btn-primary"
          >
            <Plus className="w-3 h-3" /> New customer
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-500" />
          <input
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
            placeholder="Search code, payment method, contract..."
            className="input pl-8"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-100"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick risk filter chips */}
        <div className="flex gap-1">
          {RISK_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => toggleRiskFilter(lvl)}
              className={`badge cursor-pointer transition-all ${
                filters.riskLevel.includes(lvl)
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'bg-ink-800/50 text-ink-400 border border-ink-700 hover:border-ink-600'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="panel p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label-mono block mb-1">Contract</label>
            <select
              value={filters.contract}
              onChange={(e) => { setFilters({ ...filters, contract: e.target.value }); setPage(1); }}
              className="select"
            >
              <option value="">All</option>
              {CONTRACTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-mono block mb-1">Internet Service</label>
            <select
              value={filters.internetService}
              onChange={(e) => { setFilters({ ...filters, internetService: e.target.value }); setPage(1); }}
              className="select"
            >
              <option value="">All</option>
              {INTERNETS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-mono block mb-1">Status</label>
            <select
              value={filters.isChurned}
              onChange={(e) => { setFilters({ ...filters, isChurned: e.target.value }); setPage(1); }}
              className="select"
            >
              <option value="">All</option>
              <option value="false">Active</option>
              <option value="true">Churned</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-mono block mb-1">Min tenure</label>
              <input
                type="number"
                value={filters.minTenure}
                onChange={(e) => { setFilters({ ...filters, minTenure: e.target.value }); setPage(1); }}
                className="input"
              />
            </div>
            <div>
              <label className="label-mono block mb-1">Max tenure</label>
              <input
                type="number"
                value={filters.maxTenure}
                onChange={(e) => { setFilters({ ...filters, maxTenure: e.target.value }); setPage(1); }}
                className="input"
              />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="col-span-full">
              <button onClick={clearFilters} className="btn">
                <X className="w-3 h-3" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-ink-900/80 border-b border-ink-800 sticky top-0">
              <tr className="text-left text-ink-500">
                <SortHeader field="customerCode" label="Code" />
                <th className="px-3 py-2 label-mono font-normal">Risk</th>
                <SortHeader field="churnRiskScore" label="Score" align="right" />
                <SortHeader field="tenure" label="Tenure" align="right" />
                <th className="px-3 py-2 label-mono font-normal">Contract</th>
                <th className="px-3 py-2 label-mono font-normal">Internet</th>
                <SortHeader field="monthlyCharges" label="Monthly" align="right" />
                <th className="px-3 py-2 label-mono font-normal">Status</th>
                <th className="px-3 py-2 label-mono font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-ink-500">Loading...</td></tr>
              )}
              {!loading && data.items.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-ink-500">
                  Tidak ada customer yang cocok dengan filter.
                </td></tr>
              )}
              {!loading && data.items.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-3 py-2">
                    <Link to={`/customers/${c.id}`} className="text-accent hover:underline font-mono">
                      {c.customerCode}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <RiskBadge level={c.riskLevel} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {c.churnRiskScore != null ? (c.churnRiskScore * 100).toFixed(1) + '%' : '-'}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.tenure} <span className="text-ink-600">mo</span></td>
                  <td className="px-3 py-2 text-ink-300">{c.contract}</td>
                  <td className="px-3 py-2 text-ink-300">{c.internetService}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(c.monthlyCharges)}</td>
                  <td className="px-3 py-2">
                    {c.isChurned ? (
                      <span className="badge bg-red-500/15 text-red-300 border border-red-500/30">Churned</span>
                    ) : (
                      <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Active</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Link to={`/customers/${c.id}/edit`} className="btn !py-1 !px-2">Edit</Link>
                      <button
                        onClick={() => deleteCustomer(c.id, c.customerCode)}
                        className="btn btn-danger !py-1 !px-2"
                        title="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-ink-800 px-3 py-2 flex items-center justify-between text-xs">
          <div className="text-ink-500">
            Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1}–
            {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{' '}
            {data.pagination.total}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn !py-1"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-2 tabular-nums">
              {data.pagination.page} / {data.pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page >= data.pagination.totalPages}
              className="btn !py-1"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
