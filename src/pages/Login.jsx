import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@churn.app', password: 'password123' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Login berhasil');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 grid-bg border-r border-ink-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-semibold tracking-tight">retentio</span>
            <span className="text-[10px] text-ink-500 uppercase tracking-widest ml-2">v1.0</span>
          </div>

          <div>
            <div className="label-mono mb-3">// customer churn intelligence</div>
            <h1 className="font-display text-5xl font-semibold tracking-tight leading-[1.05] mb-4">
              Predict who's
              <br />
              about to <span className="text-accent">leave</span>.
            </h1>
            <p className="text-ink-400 text-sm max-w-md leading-relaxed">
              Random Forest classification trained on Telco Churn dataset. Real-time risk scoring,
              top feature importance, dan retention dashboard untuk CS Agent.
            </p>
          </div>

          <div className="flex gap-6 text-xs">
            <div>
              <div className="label-mono mb-1">Model</div>
              <div className="font-medium">Random Forest</div>
            </div>
            <div>
              <div className="label-mono mb-1">Target Recall</div>
              <div className="font-medium tabular-nums">≥ 80%</div>
            </div>
            <div>
              <div className="label-mono mb-1">Latency</div>
              <div className="font-medium tabular-nums">&lt; 2s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-semibold">retentio</span>
          </div>

          <div className="label-mono mb-1">[01] authenticate</div>
          <h2 className="font-display text-2xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-ink-400 mb-6">Masukkan kredensial untuk mengakses dashboard.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-mono block mb-1.5">email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="label-mono block mb-1.5">password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary justify-center py-2.5 text-sm"
            >
              {loading ? 'authenticating...' : (
                <>
                  Sign in <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-800 text-xs text-ink-500">
            <div className="mb-2">Demo credentials:</div>
            <div className="space-y-1 font-mono">
              <div>admin@churn.app / password123</div>
              <div>agent@churn.app / password123</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-ink-400">
            Belum punya akun?{' '}
            <Link to="/register" className="text-accent hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
