import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Akun berhasil dibuat');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Register gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 grid-bg">
      <div className="w-full max-w-sm panel p-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-accent" />
          <span className="font-display text-lg font-semibold">retentio</span>
        </div>

        <div className="label-mono mb-1">[register]</div>
        <h2 className="font-display text-2xl font-semibold mb-6">Buat akun baru</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-mono block mb-1.5">nama</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label-mono block mb-1.5">email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label-mono block mb-1.5">password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label-mono block mb-1.5">role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="select"
            >
              <option value="AGENT">CS Agent</option>
              <option value="MANAGER">Retention Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary justify-center py-2.5"
          >
            {loading ? 'creating...' : (
              <>
                Create account <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-xs text-ink-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
