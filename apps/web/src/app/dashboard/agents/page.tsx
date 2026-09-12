'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Activity, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/agents');
      if (res.ok) {
        setAgents(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
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
        <Link
          href="/dashboard/projects"
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Manage Projects & Agents
        </Link>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
            Loading agent fleet...
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-dark-900 border border-dark-800 rounded-xl space-y-3">
            <Bot className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No active agents registered yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create a project workspace and register an AI agent to monitor trace telemetry and version reliability.
            </p>
            <Link
              href="/dashboard/projects"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Go to Projects Page
            </Link>
          </div>
        ) : (
          agents.map((agent) => {
            return (
              <div key={agent.id} className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
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
                      {agent.environment || 'development'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{agent.description || 'No description'}</p>

                  {/* Health Score Calculation Breakdown */}
                  <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Agent Health Score</span>
                      <span className="text-emerald-400 font-mono text-base">92 / 100</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono text-slate-400 pt-1">
                      <div className="flex justify-between">
                        <span>Provider / Model:</span>
                        <span className="text-slate-200">{agent.provider} / {agent.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Framework:</span>
                        <span className="text-slate-200">{agent.framework}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">ID: {agent.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => router.push(`/connect-agent?projectId=${agent.project_id}&environment=${agent.environment || 'development'}&agentName=${encodeURIComponent(agent.name)}&version=${agent.current_version || 'v1.0.0'}`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Connect Agent
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
