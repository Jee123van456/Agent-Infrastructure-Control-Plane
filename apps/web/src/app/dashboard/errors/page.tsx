'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Layers, Bug, RefreshCw } from 'lucide-react';

export default function ErrorsPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/errors/clusters', { headers });
        if (res.ok) setClusters(await res.json());
      } catch (e) {
        console.error("Error fetching error clusters:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Bug className="h-6 w-6 text-crimson-400" />
          Failure Intelligence & Error Clustering
        </h1>
        <p className="text-xs text-slate-400">Group recurring agent trace failures into actionable root-cause engineering clusters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clusters.map((c, idx) => (
          <div key={idx} className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-crimson-500/20 text-crimson-400 border border-crimson-500/30 font-mono">
                  {c.error_type}
                </span>
                <h3 className="text-base font-bold text-white">{c.cluster_name}</h3>
              </div>

              <span className="text-xs font-mono text-amber-400 font-bold">
                {c.affected_runs} Affected Runs
              </span>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800 text-xs font-mono text-slate-300">
              <span className="text-slate-500 font-bold block mb-1">REPRESENTATIVE SAMPLE ERROR:</span>
              <span className="text-crimson-300">{c.sample_error}</span>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400">
              <span>Last seen: {new Date(c.last_seen).toLocaleTimeString()}</span>
              {c.representative_trace_id && (
                <Link 
                  href={`/dashboard/traces/${c.representative_trace_id}`}
                  className="text-blue-400 hover:underline flex items-center gap-1"
                >
                  Inspect Sample Trace <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
