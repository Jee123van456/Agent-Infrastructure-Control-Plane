'use client';

import { useState, useEffect } from 'react';
import { GitCompare, AlertTriangle, ArrowRight, TrendingDown, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

export default function RegressionsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegressions = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/regressions', { headers });
        if (res.ok) setReports(await res.json());
      } catch (e) {
        console.error("Error fetching regression report:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRegressions();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <GitCompare className="h-6 w-6 text-amber-400" />
          Automated Agent Version Regression Center
        </h1>
        <p className="text-xs text-slate-400">Identify performance degradations, tool timeouts, and cost spikes across agent releases.</p>
      </div>

      {loading ? (
        <div className="p-8 text-slate-400 font-mono">Analyzing version regressions...</div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.agent_id} className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-6 shadow-xl">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dark-800">
                <div>
                  <h2 className="text-lg font-bold text-white">{report.agent_name}</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Comparing Baseline Release <span className="text-emerald-400 font-bold">{report.previous_version}</span> &rarr; Current Release <span className="text-amber-400 font-bold">{report.current_version}</span>
                  </p>
                </div>

                <div>
                  {report.is_regression_detected ? (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono inline-flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      REGRESSION DETECTED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      STABLE RELEASE
                    </span>
                  )}
                </div>
              </div>

              {/* Regressions Grid */}
              {report.regressions && report.regressions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {report.regressions.map((reg: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-dark-950 border border-crimson-500/30 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{reg.metric_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-crimson-500/20 text-crimson-400 text-[10px] font-bold">
                          {reg.severity} SEVERITY
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 line-through">{reg.previous_value}</span>
                        <span className="text-xl font-bold text-crimson-400">{reg.current_value}</span>
                      </div>

                      <div className="text-[11px] text-amber-400">
                        Delta: {reg.delta_percent}%
                      </div>

                      <div className="pt-2 border-t border-dark-800 text-[10px] text-slate-300 font-sans">
                        <strong className="text-blue-400 font-mono">Likely Factor: </strong> {reg.likely_factor}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded bg-dark-950 text-slate-400 text-xs font-mono">
                  No metric regressions detected between version {report.previous_version} and {report.current_version}.
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
