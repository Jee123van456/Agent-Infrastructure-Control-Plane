'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, CheckCircle2, AlertTriangle, Clock, DollarSign, Cpu, 
  TrendingDown, ShieldCheck, ArrowRight, RefreshCw, Layers
} from 'lucide-react';

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [recentTraces, setRecentTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('td_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [mRes, cRes, tRes] = await Promise.all([
        fetch('/api/v1/metrics/overview', { headers }),
        fetch('/api/v1/metrics/cost-breakdown', { headers }),
        fetch('/api/v1/traces?limit=10', { headers }),
      ]);

      if (mRes.ok) setMetrics(await mRes.ok ? await mRes.json() : null);
      if (cRes.ok) setCostData(await cRes.ok ? await cRes.json() : null);
      if (tRes.ok) setRecentTraces(await tRes.json());
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title & Time Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agent Infrastructure Control Plane</h1>
          <p className="text-xs text-slate-400">Real-time engineering intelligence across all production AI agents.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-lg border border-dark-800 text-xs font-mono">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  timeRange === range ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button 
            onClick={fetchData} 
            className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Onboarding Progress Checklist Banner */}
      <div className="p-5 rounded-xl bg-dark-900 border border-blue-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-mono">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            CONNECT YOUR FIRST AGENT
          </div>
          <Link href="/connect-agent" className="text-xs text-blue-400 hover:underline font-mono flex items-center gap-1 font-semibold">
            Open Wizard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-dark-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
            <span>1. Create Project</span>
            <span>✓</span>
          </div>
          <div className="p-2.5 rounded bg-dark-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
            <span>2. Generate Key</span>
            <span>✓</span>
          </div>
          <div className="p-2.5 rounded bg-dark-950 border border-blue-500/30 text-blue-400 flex items-center justify-between">
            <span>3. Install SDK</span>
            <span>→</span>
          </div>
          <div className="p-2.5 rounded bg-dark-950 border border-dark-800 text-slate-400 flex items-center justify-between">
            <span>4. Send First Trace</span>
            <span>→</span>
          </div>
          <div className="p-2.5 rounded bg-dark-950 border border-dark-800 text-slate-400 flex items-center justify-between">
            <span>5. Agent Health</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* Active Alert Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3 text-amber-300 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div>
            <strong className="text-white font-semibold">AUTOMATED REGRESSION ALERT DETECTED:</strong> Customer Support Agent success rate dropped 12.1% after version 1.5 release.
          </div>
        </div>
        <Link 
          href="/dashboard/regressions" 
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
        >
          View Version Diff <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Runs */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL AGENT RUNS</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {metrics?.total_runs ?? 70}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span>+14% vs last period</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SUCCESS RATE</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics?.success_rate_percent ?? 85.7}%
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            -8.5% regression in v1.5
          </div>
        </div>

        {/* Avg Latency */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>P50 / P95 LATENCY</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {metrics ? `${Math.round(metrics.p50_latency_ms/100)/10}s / ${Math.round(metrics.p95_latency_ms/100)/10}s` : '2.4s / 6.2s'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Avg: {metrics ? `${Math.round(metrics.avg_latency_ms)}ms` : '3,450ms'}
          </div>
        </div>

        {/* Monthly Cost */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL ESTIMATED SPEND</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ${metrics?.total_cost_usd ?? 1.48}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {(metrics?.total_tokens ?? 184500).toLocaleString()} tokens
          </div>
        </div>

      </div>

      {/* Model Spend Distribution & Tool Errors Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cost Breakdown Panel */}
        <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 md:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-400" />
            Provider Spend Distribution
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {costData?.providers?.map((p: any) => (
              <div key={p.provider} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{p.provider}</span>
                  <span className="text-white font-bold">${p.amount_usd} ({p.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            )) || (
              <div className="text-slate-400">Loading cost telemetry...</div>
            )}
          </div>
        </div>

        {/* Recent Execution Traces Table */}
        <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Recent Agent Traces
            </h3>
            <Link href="/dashboard/traces" className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              View All Traces &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dark-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">AGENT & VERSION</th>
                  <th className="py-2.5 px-3">DURATION</th>
                  <th className="py-2.5 px-3">TOKENS</th>
                  <th className="py-2.5 px-3">COST</th>
                  <th className="py-2.5 px-3">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/60 font-mono">
                {recentTraces.map((tr) => (
                  <tr key={tr.id} className="hover:bg-dark-850/50 transition-colors">
                    <td className="py-3 px-3">
                      {tr.status === 'SUCCESS' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          SUCCESS
                        </span>
                      )}
                      {tr.status === 'ERROR' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-crimson-500/20 text-crimson-400 border border-crimson-500/30">
                          ERROR
                        </span>
                      )}
                      {tr.status === 'POLICY_VIOLATION' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          VIOLATION
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-bold">{tr.agent_name || 'Support Agent'}</div>
                      <div className="text-[10px] text-slate-500">{tr.agent_version} • {tr.name}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {Math.round(tr.total_duration_ms)}ms
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {tr.total_input_tokens + tr.total_output_tokens}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      ${tr.total_cost_usd}
                    </td>
                    <td className="py-3 px-3">
                      <Link 
                        href={`/dashboard/traces/${tr.id}`}
                        className="text-blue-400 hover:underline font-medium text-[11px]"
                      >
                        Inspect Trace
                      </Link>
                    </td>
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
