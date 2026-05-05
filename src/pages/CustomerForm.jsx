import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../lib/api';

const EMPTY = {
  customerCode: '',
  gender: 'Male',
  seniorCitizen: false,
  partner: false,
  dependents: false,
  tenure: 0,
  contract: 'Month-to-month',
  paperlessBilling: false,
  paymentMethod: 'Electronic check',
  monthlyCharges: 0,
  totalCharges: 0,
  phoneService: true,
  multipleLines: 'No',
  internetService: 'DSL',
  onlineSecurity: 'No',
  onlineBackup: 'No',
  deviceProtection: 'No',
  techSupport: 'No',
  streamingTV: 'No',
  streamingMovies: 'No',
  isChurned: false,
  notes: '',
};

const YN_NS = ['Yes', 'No', 'No internet service'];
const PAYMENTS = [
  'Electronic check',
  'Mailed check',
  'Bank transfer (automatic)',
  'Credit card (automatic)',
];

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/customers/${id}`)
      .then((res) => setForm({ ...EMPTY, ...res.data.customer }))
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      payload.tenure = Number(payload.tenure);
      payload.monthlyCharges = Number(payload.monthlyCharges);
      payload.totalCharges = Number(payload.totalCharges);

      if (isEdit) {
        await api.put(`/customers/${id}`, payload);
        toast.success('Customer diperbarui');
      } else {
        const { data } = await api.post('/customers', payload);
        toast.success('Customer dibuat');
        navigate(`/customers/${data.customer.id}`);
        return;
      }
      navigate(`/customers/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-ink-400 text-sm">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="btn mb-4">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      <div className="label-mono mb-1">// {isEdit ? 'edit' : 'new'} customer</div>
      <h1 className="font-display text-2xl font-semibold mb-6">
        {isEdit ? `Edit ${form.customerCode}` : 'New Customer'}
      </h1>

      <form onSubmit={submit} className="space-y-4">
        {/* Identifier */}
        <Section title="[01] Identifier">
          <Field label="Customer Code">
            <input
              required
              value={form.customerCode}
              onChange={(e) => update('customerCode', e.target.value)}
              className="input"
              disabled={isEdit}
              placeholder="CUST-00001"
            />
          </Field>
        </Section>

        {/* Demographics */}
        <Section title="[02] Demographics">
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="select">
              <option>Male</option><option>Female</option>
            </select>
          </Field>
          <Toggle label="Senior Citizen" value={form.seniorCitizen} onChange={(v) => update('seniorCitizen', v)} />
          <Toggle label="Partner" value={form.partner} onChange={(v) => update('partner', v)} />
          <Toggle label="Dependents" value={form.dependents} onChange={(v) => update('dependents', v)} />
        </Section>

        {/* Account */}
        <Section title="[03] Account">
          <Field label="Tenure (months)">
            <input
              type="number" min={0}
              value={form.tenure}
              onChange={(e) => update('tenure', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Contract">
            <select value={form.contract} onChange={(e) => update('contract', e.target.value)} className="select">
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </Field>
          <Field label="Payment Method">
            <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className="select">
              {PAYMENTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Toggle label="Paperless Billing" value={form.paperlessBilling} onChange={(v) => update('paperlessBilling', v)} />
          <Field label="Monthly Charges ($)">
            <input
              type="number" step="0.01" min={0}
              value={form.monthlyCharges}
              onChange={(e) => update('monthlyCharges', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Total Charges ($)">
            <input
              type="number" step="0.01" min={0}
              value={form.totalCharges}
              onChange={(e) => update('totalCharges', e.target.value)}
              className="input"
            />
          </Field>
        </Section>

        {/* Services */}
        <Section title="[04] Services">
          <Toggle label="Phone Service" value={form.phoneService} onChange={(v) => update('phoneService', v)} />
          <Field label="Multiple Lines">
            <select value={form.multipleLines} onChange={(e) => update('multipleLines', e.target.value)} className="select">
              <option>Yes</option><option>No</option><option>No phone service</option>
            </select>
          </Field>
          <Field label="Internet Service">
            <select value={form.internetService} onChange={(e) => update('internetService', e.target.value)} className="select">
              <option>DSL</option><option>Fiber optic</option><option>No</option>
            </select>
          </Field>
          {[
            ['onlineSecurity', 'Online Security'],
            ['onlineBackup', 'Online Backup'],
            ['deviceProtection', 'Device Protection'],
            ['techSupport', 'Tech Support'],
            ['streamingTV', 'Streaming TV'],
            ['streamingMovies', 'Streaming Movies'],
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <select value={form[k]} onChange={(e) => update(k, e.target.value)} className="select">
                {YN_NS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          ))}
        </Section>

        {/* Status */}
        <Section title="[05] Status">
          <Toggle label="Sudah Churned" value={form.isChurned} onChange={(v) => update('isChurned', v)} />
          <Field label="Notes" className="col-span-full">
            <textarea
              value={form.notes || ''}
              onChange={(e) => update('notes', e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Catatan tentang customer..."
            />
          </Field>
        </Section>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save className="w-3 h-3" />
            {saving ? 'Saving...' : isEdit ? 'Update customer' : 'Create customer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <div className="label-mono mb-1">{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer">
      <span className="label-mono">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          value ? 'bg-accent' : 'bg-ink-700'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}
