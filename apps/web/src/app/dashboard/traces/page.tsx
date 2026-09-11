'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Search, Filter, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TracesExplorerPage() {
  const [traces, setTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [versionFilter, setVersionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTraces = async () => {
    setLoading(true);
    const token = localStorage.getItem('td_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let url = '/api/v1/traces?limit=50';
    if (statusFilter !== 'ALL') url += `&status_filter=${statusFilter}`;
    if (versionFilter !== 'ALL') url += `&version_filter=${versionFilter}`;

    try {
      const res = await fetch(url, { headers });
      if (res.ok) setTraces(await res.json());
    } catch (e) {
      console.error("Error fetching traces:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, [statusFilter, versionFilter]);

  const filteredTraces = traces.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.trace_id_external.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.input_text && t.input_text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trace Explorer</h1>
          <p className="text-xs text-slate-400">Multi-step execution trajectories captured across production AI agents.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTraces}
            className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-dark-900 border border-dark-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trace ID, prompt text, or agent..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-dark-950 border border-dark-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-950 border border-dark-800 rounded px-2.5 py-1 text-white focus:outline-none"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="ERROR">ERROR</option>
              <option value="POLICY_VIOLATION">POLICY VIOLATION</option>
            </select>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">VERSION:</span>
            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="bg-dark-950 border border-dark-800 rounded px-2.5 py-1 text-white focus:outline-none"
            >
              <option value="ALL">ALL VERSIONS</option>
              <option value="v1.4">v1.4</option>
              <option value="v1.5">v1.5</option>
              <option value="v1.0">v1.0</option>
            </select>
          </div>
        </div>
      </div>

      {/* Traces Table */}
      <div className="rounded-xl bg-dark-900 border border-dark-800 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-dark-800 bg-dark-850/50 text-slate-400 font-mono">
              <th className="py-3 px-4">TRACE ID & NAME</th>
              <th className="py-3 px-4">AGENT</th>
              <th className="py-3 px-4">VERSION</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">DURATION</th>
              <th className="py-3 px-4">TOKENS</th>
              <th className="py-3 px-4">COST</th>
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60 font-mono">
            {filteredTraces.map((tr) => (
              <tr key={tr.id} className="hover:bg-dark-850/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="text-slate-200 font-bold truncate max-w-[200px]">{tr.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{tr.trace_id_external}</div>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {tr.agent_name || 'Support Agent'}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-dark-950 border border-dark-800 text-[10px]">
                    {tr.agent_version}
                  </span>
                </td>
                <td className="py-3 px-4">
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
                <td className="py-3 px-4 text-slate-300">
                  {Math.round(tr.total_duration_ms)}ms
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {tr.total_input_tokens + tr.total_output_tokens}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  ${tr.total_cost_usd}
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">
                  {new Date(tr.created_at).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4">
                  <Link 
                    href={`/dashboard/traces/${tr.id}`}
                    className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold hover:bg-blue-600/30 transition-colors inline-flex items-center gap-1"
                  >
                    Inspect <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
