import { useState } from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../lib/api';
import { RiskBadge } from '../lib/format';

const SAMPLE = {
  gender: 'Male',
  seniorCitizen: false,
  partner: false,
  dependents: false,
  tenure: 5,
  contract: 'Month-to-month',
  paperlessBilling: true,
  paymentMethod: 'Electronic check',
  monthlyCharges: 89.5,
  totalCharges: 447.5,
  phoneService: true,
  multipleLines: 'No',
  internetService: 'Fiber optic',
  onlineSecurity: 'No',
  onlineBackup: 'No',
  deviceProtection: 'No',
  techSupport: 'No',
  streamingTV: 'Yes',
  streamingMovies: 'Yes',
};

const PAYMENTS = ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'];

export default function Predict() {
  const [form, setForm] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tenure: Number(form.tenure),
        monthlyCharges: Number(form.monthlyCharges),
        totalCharges: Number(form.totalCharges),
      };
      const { data } = await api.post('/predictions/predict', payload);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Predict gagal — pastikan ML service jalan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="label-mono mb-1">// retentio / predict</div>
      <h1 className="font-display text-2xl font-semibold mb-1">Quick Churn Predict</h1>
      <p className="text-sm text-ink-400 mb-6">
        Test prediction tanpa simpan. Berguna untuk eksperimen sebelum input customer baru.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 panel p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Tenure">
              <input type="number" value={form.tenure} onChange={(e) => update('tenure', e.target.value)} className="input" />
            </Field>
            <Field label="Monthly Charges">
              <input type="number" step="0.01" value={form.monthlyCharges} onChange={(e) => update('monthlyCharges', e.target.value)} className="input" />
            </Field>
            <Field label="Total Charges">
              <input type="number" step="0.01" value={form.totalCharges} onChange={(e) => update('totalCharges', e.target.value)} className="input" />
            </Field>
            <Field label="Contract">
              <select value={form.contract} onChange={(e) => update('contract', e.target.value)} className="select">
                <option>Month-to-month</option><option>One year</option><option>Two year</option>
              </select>
            </Field>
            <Field label="Internet">
              <select value={form.internetService} onChange={(e) => update('internetService', e.target.value)} className="select">
                <option>DSL</option><option>Fiber optic</option><option>No</option>
              </select>
            </Field>
            <Field label="Payment">
              <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className="select">
                {PAYMENTS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="select">
                <option>Male</option><option>Female</option>
              </select>
            </Field>
            <Field label="Senior Citizen">
              <select value={String(form.seniorCitizen)} onChange={(e) => update('seniorCitizen', e.target.value === 'true')} className="select">
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </Field>
            <Field label="Partner">
              <select value={String(form.partner)} onChange={(e) => update('partner', e.target.value === 'true')} className="select">
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </Field>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            <Sparkles className="w-3 h-3" />
            {loading ? 'Predicting...' : 'Predict churn'}
          </button>
        </form>

        {/* Result */}
        <div className="panel p-5">
          <div className="label-mono mb-3">[result]</div>
          {!result ? (
            <div className="text-xs text-ink-500 italic">
              Submit form untuk lihat prediction.
            </div>
          ) : (
            <>
              <div className="font-display text-5xl font-semibold tabular-nums mb-2">
                {(result.score * 100).toFixed(0)}%
              </div>
              <RiskBadge level={result.riskLevel} />
              <div className="mt-4 h-2 bg-ink-800 rounded overflow-hidden">
                <div
                  className={`h-full ${
                    result.riskLevel === 'CRITICAL' ? 'bg-red-400' :
                    result.riskLevel === 'HIGH' ? 'bg-orange-400' :
                    result.riskLevel === 'MEDIUM' ? 'bg-amber-400' :
                    'bg-emerald-400'
                  }`}
                  style={{ width: `${result.score * 100}%` }}
                />
              </div>

              <div className="mt-5">
                <div className="label-mono mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Top factors
                </div>
                <div className="space-y-2">
                  {result.topFactors?.slice(0, 5).map((f, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-ink-200 truncate">{f.feature}</span>
                        <span className="tabular-nums text-ink-400">
                          {(f.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1 bg-ink-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${Math.min(100, f.importance * 200)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="label-mono mb-1">{label}</div>
      {children}
    </label>
  );
}
