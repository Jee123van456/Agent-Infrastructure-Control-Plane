'use client';

import { useState, useEffect } from 'react';
import { Network, Activity, Clock, DollarSign, Layers, ChevronRight, User, Filter } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) setSelectedSession(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-400" />
            Session Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Group multi-turn user agent interactions into unified execution sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSessions}
            className="px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-700 text-xs text-slate-300 hover:text-white font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Active Sessions ({sessions.length})
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              No active sessions recorded yet. Pass <code className="text-blue-400">session_id</code> in the TylerDeck SDK.
            </div>
          ) : (
            sessions.map((s) => {
              const isSelected = selectedSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/10 border-blue-500/40 text-white' 
                      : 'bg-dark-900 border-dark-800 hover:border-dark-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400 truncate">
                      {s.external_session_id || s.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-800 text-emerald-400 border border-dark-700">
                      {s.environment}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-slate-500" />
                      <span>{s.trace_count} traces</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{s.total_latency_ms}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-slate-500" />
                      <span>${s.total_cost_usd}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-dark-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {s.user_id_external || 'Anonymous User'}
                    </span>
                    <span>{new Date(s.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSession ? (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-dark-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white font-mono">
                    Session: {selectedSession.external_session_id || selectedSession.id}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Created at {new Date(selectedSession.created_at).toLocaleString()} • User: {selectedSession.user_id_external || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
                    {selectedSession.environment.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[11px] text-slate-400">Total Traces</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">{selectedSession.trace_count}</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[11px] text-slate-400">Cumulative Latency</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">{selectedSession.total_latency_ms} ms</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[11px] text-slate-400">Cumulative Cost</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">${selectedSession.total_cost_usd}</div>
                </div>
              </div>

              {/* Session Timeline */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Multi-Turn Execution Traces
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">Order Inquiry Flow (Turn 1)</div>
                        <div className="text-[11px] text-slate-400">"Where is my order #ORD-9912?"</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                      SUCCESS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              Select a session to inspect trace sequence and conversation metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
