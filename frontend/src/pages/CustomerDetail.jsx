import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, RefreshCw, Calendar, User, CreditCard,
  Wifi, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../lib/api';
import { RiskBadge, formatCurrency, formatDate } from '../lib/format';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/customers/${id}`)
      .then((res) => setCustomer(res.data.customer))
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const repredict = async () => {
    setPredicting(true);
    try {
      const { data } = await api.post(`/predictions/customer/${id}`);
      setCustomer(data.customer);
      toast.success('Prediction diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal predict');
    } finally {
      setPredicting(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Hapus customer ${customer.customerCode}?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer dihapus');
      navigate('/customers');
    } catch {
      toast.error('Gagal hapus');
    }
  };

  if (loading || !customer) return <div className="p-8 text-ink-400 text-sm">Loading...</div>;

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      <button onClick={() => navigate('/customers')} className="btn">
        <ArrowLeft className="w-3 h-3" /> All customers
      </button>

      {/* Header */}
      <div className="panel p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="label-mono mb-1">// customer</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight font-mono">
            {customer.customerCode}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-ink-500">
            <Calendar className="w-3 h-3" />
            Created {formatDate(customer.createdAt)}
            {customer.createdBy && <span>· by {customer.createdBy.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={repredict} disabled={predicting} className="btn">
            <RefreshCw className={`w-3 h-3 ${predicting ? 'animate-spin' : ''}`} />
            Re-predict
          </button>
          <Link to={`/customers/${id}/edit`} className="btn">
            <Edit className="w-3 h-3" /> Edit
          </Link>
          <button onClick={remove} className="btn btn-danger">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>

      {/* Risk score banner */}
      <div className="panel p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="label-mono mb-2">Churn Risk</div>
            <div className="flex items-center gap-3">
              <div className="font-display text-5xl font-semibold tabular-nums">
                {customer.churnRiskScore != null
                  ? `${(customer.churnRiskScore * 100).toFixed(0)}%`
                  : '—'}
              </div>
              <RiskBadge level={customer.riskLevel} />
            </div>
            {customer.lastPredictedAt && (
              <div className="text-xs text-ink-500 mt-2">
                Last predicted {formatDate(customer.lastPredictedAt)}
              </div>
            )}
            <div className="mt-4 h-2 bg-ink-800 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  customer.riskLevel === 'CRITICAL' ? 'bg-red-400' :
                  customer.riskLevel === 'HIGH' ? 'bg-orange-400' :
                  customer.riskLevel === 'MEDIUM' ? 'bg-amber-400' :
                  'bg-emerald-400'
                }`}
                style={{ width: `${(customer.churnRiskScore || 0) * 100}%` }}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="label-mono mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Top Risk Factors
            </div>
            {Array.isArray(customer.topRiskFactors) && customer.topRiskFactors.length > 0 ? (
              <div className="space-y-2">
                {customer.topRiskFactors.slice(0, 5).map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-ink-200">{f.feature}</span>
                      <span className="tabular-nums text-ink-400">
                        {(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-ink-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.min(100, f.importance * 200)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-ink-500">
                Belum ada prediction. Klik "Re-predict" untuk generate.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <InfoPanel title="[01] Demographics" icon={User}>
          <Row label="Gender" value={customer.gender} />
          <Row label="Senior Citizen" value={customer.seniorCitizen ? 'Yes' : 'No'} />
          <Row label="Partner" value={customer.partner ? 'Yes' : 'No'} />
          <Row label="Dependents" value={customer.dependents ? 'Yes' : 'No'} />
        </InfoPanel>

        <InfoPanel title="[02] Account" icon={CreditCard}>
          <Row label="Tenure" value={`${customer.tenure} months`} />
          <Row label="Contract" value={customer.contract} />
          <Row label="Paperless" value={customer.paperlessBilling ? 'Yes' : 'No'} />
          <Row label="Payment" value={customer.paymentMethod} />
          <Row label="Monthly" value={formatCurrency(customer.monthlyCharges)} />
          <Row label="Total" value={formatCurrency(customer.totalCharges)} />
        </InfoPanel>

        <InfoPanel title="[03] Services" icon={Wifi}>
          <Row label="Phone" value={customer.phoneService ? 'Yes' : 'No'} />
          <Row label="Multiple Lines" value={customer.multipleLines} />
          <Row label="Internet" value={customer.internetService} />
          <Row label="Online Security" value={customer.onlineSecurity} />
          <Row label="Online Backup" value={customer.onlineBackup} />
          <Row label="Device Protection" value={customer.deviceProtection} />
          <Row label="Tech Support" value={customer.techSupport} />
          <Row label="Streaming TV" value={customer.streamingTV} />
          <Row label="Streaming Movies" value={customer.streamingMovies} />
        </InfoPanel>
      </div>

      {customer.notes && (
        <div className="panel p-4">
          <div className="label-mono mb-2">// notes</div>
          <p className="text-sm text-ink-200 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoPanel({ title, icon: Icon, children }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {Icon && <Icon className="w-3.5 h-3.5 text-ink-500" />}
          {title}
        </div>
      </div>
      <div className="p-4 space-y-1.5 text-xs">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-100 font-medium text-right truncate">{value}</span>
    </div>
  );
}
