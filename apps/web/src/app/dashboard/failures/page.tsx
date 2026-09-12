'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, ShieldAlert, Clock, ArrowRight, RefreshCw, Layers, Terminal, ExternalLink 
} from 'lucide-react';

interface ErrorCluster {
  cluster_name: string;
  error_type: string;
  affected_runs: number;
  last_seen: string;
  representative_trace_id: string;
  sample_error: string;
  affected_agent?: string;
  affected_version?: string;
}

export default function FailuresPage() {
  const [clusters, setClusters] = useState<ErrorCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('http://localhost:8000/api/v1/errors/clusters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClusters(data);
      }
    } catch (e) {
      console.error("Failed to fetch failure clusters", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Failure Intelligence & Clusters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated aggregation of agent runtime failures, tool timeouts, validation errors, and policy violations.
          </p>
        </div>

        <button 
          onClick={fetchClusters} 
          className="px-3.5 py-1.5 rounded-lg bg-dark-900 border border-dark-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Clusters
        </button>
      </div>

      {/* Failure Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clusters.map((c, i) => (
          <div 
            key={i} 
            className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl hover:border-dark-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  c.error_type === 'SECURITY_VIOLATION' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {c.error_type}
                </span>
                <h3 className="text-base font-bold text-white mt-2 flex items-center gap-2">
                  {c.cluster_name}
                </h3>
              </div>

              <div className="text-right font-mono">
                <div className="text-xl font-extrabold text-red-400">{c.affected_runs}</div>
                <div className="text-[10px] text-slate-500">AFFECTED RUNS</div>
              </div>
            </div>

            {/* Affected Agent Metadata */}
            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Affected Agent</div>
                <div className="text-slate-200 font-semibold truncate">{c.affected_agent || 'Customer Support Agent'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Affected Version</div>
                <div className="text-slate-200 font-semibold">{c.affected_version || 'v1.1'}</div>
              </div>
            </div>

            {/* Error Sample */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Sample Error Message</div>
              <div className="p-3 rounded bg-dark-950 border border-red-500/20 font-mono text-xs text-red-300 leading-relaxed overflow-x-auto">
                {c.sample_error}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-dark-800/60 text-xs">
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                Last seen: {new Date(c.last_seen).toLocaleTimeString()}
              </span>

              <Link 
                href={`/dashboard/traces?error=${encodeURIComponent(c.cluster_name)}`}
                className="text-blue-400 hover:text-blue-300 font-mono text-xs flex items-center gap-1 font-semibold"
              >
                <span>Inspect Traces ({c.affected_runs})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
