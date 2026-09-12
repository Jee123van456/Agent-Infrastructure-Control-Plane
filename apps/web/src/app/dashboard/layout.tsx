'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Activity, LayoutDashboard, FolderKanban, Bot, Cpu, GitCompare, 
  AlertTriangle, DollarSign, ShieldCheck, Bell, Key, Settings, LogOut, Search, CheckCircle2,
  Network, Database, Webhook
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [env, setEnv] = useState('production');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('td_user');
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {}
    } else {
      setUser({ full_name: 'Alex Mercer', email: 'alex@acmeai.com' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('td_token');
    localStorage.removeItem('td_user');
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'Traces', href: '/dashboard/traces', icon: Activity },
    { name: 'Sessions', href: '/dashboard/sessions', icon: Network },
    { name: 'Prompts', href: '/dashboard/prompts', icon: FolderKanban },
    { name: 'Playground', href: '/dashboard/playground', icon: Cpu, badge: 'LIVE' },
    { name: 'Evaluations', href: '/dashboard/evaluations', icon: CheckCircle2 },
    { name: 'Datasets', href: '/dashboard/datasets', icon: Database },
    { name: 'Experiments', href: '/dashboard/experiments', icon: GitCompare },
    { name: 'Failures', href: '/dashboard/failures', icon: AlertTriangle },
    { name: 'Regressions', href: '/dashboard/regressions', icon: GitCompare, badge: 'REGRESSION' },
    { name: 'Cost Intelligence', href: '/dashboard/cost', icon: DollarSign },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
    { name: 'Security & Policies', href: '/dashboard/security', icon: ShieldCheck },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-dark-800 bg-dark-900 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-dark-800 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">TYLER<span className="text-blue-500">DECK</span></span>
            </Link>
          </div>

          {/* Org Selector */}
          <div className="p-4 border-b border-dark-800/80">
            <div className="px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-between text-xs">
              <div className="truncate">
                <div className="font-bold text-white truncate">Acme AI Technologies</div>
                <div className="text-[10px] text-slate-400 font-mono">acme-ai-corp</div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-xs font-semibold text-white truncate">{user?.full_name || 'Alex Mercer'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || 'alex@acmeai.com'}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-crimson-400 hover:bg-dark-850 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation Header */}
        <header className="h-16 border-b border-dark-800 bg-dark-900/60 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search trace_id, prompt, tool..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-dark-950 border border-dark-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Environment Selector */}
            <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-lg border border-dark-800 text-xs font-mono">
              <button 
                onClick={() => setEnv('production')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${env === 'production' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'}`}
              >
                PROD
              </button>
              <button 
                onClick={() => setEnv('staging')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${env === 'staging' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400'}`}
              >
                STAGING
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
