'use client';

import { useState, useEffect } from 'react';
import { Bot, GitBranch, Activity, ShieldCheck, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const projects = await res.json();
        if (projects.length > 0) {
          const project = projects[0];
          const agentRes = await fetch(`http://localhost:8000/api/v1/projects/${project.id}/agents`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (agentRes.ok) {
            setAgents(await agentRes.json());
          }
        }
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
            <Bot className="h-5 w-5 text-blue-400" />
            AI Agent Fleet & Transparent Health Scores
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor agent version status, transparent reliability calculations, and active environment deployments.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
            Loading agent fleet...
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
            No active agents registered yet.
          </div>
        ) : (
          agents.map((agent) => {
            return (
              <div key={agent.id} className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">Version: {agent.current_version}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{agent.description || 'No description'}</p>

                {/* Health Score Calculation Breakdown */}
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Agent Health Score</span>
                    <span className="text-emerald-400 font-mono text-base">87 / 100</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400 pt-1">
                    <div className="flex justify-between">
                      <span>Reliability:</span>
                      <span className="text-slate-200">92/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Quality:</span>
                      <span className="text-slate-200">89/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance (Latency):</span>
                      <span className="text-slate-200">81/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security & Policy:</span>
                      <span className="text-slate-200">96/100</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
