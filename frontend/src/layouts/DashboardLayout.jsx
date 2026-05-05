import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Activity,
  LayoutDashboard,
  Users,
  Sparkles,
  LogOut,
} from 'lucide-react';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/predict', label: 'Predict', icon: Sparkles },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-ink-800 bg-ink-950/50 flex flex-col">
        <div className="px-4 py-4 border-b border-ink-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="font-display font-semibold tracking-tight">retentio</span>
            <span className="text-[9px] text-ink-500 uppercase tracking-widest ml-auto">
              v1.0
            </span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          <div className="label-mono px-2 py-2">// navigation</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent border-l-2 border-accent pl-[6px]'
                    : 'text-ink-300 hover:bg-ink-800/50 hover:text-ink-100'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-800 p-3">
          <div className="text-xs mb-2">
            <div className="font-medium text-ink-100 truncate">{user?.name}</div>
            <div className="text-ink-500 truncate">{user?.email}</div>
            <div className="mt-1">
              <span className="badge bg-ink-800 text-ink-300 border border-ink-700">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full btn justify-center text-xs"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
