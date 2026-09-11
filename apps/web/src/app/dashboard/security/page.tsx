'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SecurityPage() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/policies/violations', { headers });
        if (res.ok) setViolations(await res.json());
      } catch (e) {
        console.error("Error fetching violations:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Agent Security & Action Policy Layer
        </h1>
        <p className="text-xs text-slate-400">Define tool permissions (ALLOW, REQUIRE APPROVAL, BLOCK) and audit runtime policy violations.</p>
      </div>

      {/* Configured Policy Matrix Card */}
      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white">Active Tool Permission Policies</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
            <div className="text-white font-bold">customer_db_search</div>
            <div className="text-[10px] text-slate-400">Category: Database</div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">ALLOW</span>
              <span className="text-slate-500 text-[10px]">LOW RISK</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
            <div className="text-white font-bold">invoice_generator</div>
            <div className="text-[10px] text-slate-400">Category: API</div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">ALLOW</span>
              <span className="text-slate-500 text-[10px]">LOW RISK</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-dark-950 border border-amber-500/30 space-y-1">
            <div className="text-white font-bold">payment_api</div>
            <div className="text-[10px] text-slate-400">Category: Payment</div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-amber-400 font-bold">REQUIRE APPROVAL</span>
              <span className="text-amber-400 text-[10px]">HIGH RISK</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-dark-950 border border-crimson-500/30 space-y-1">
            <div className="text-white font-bold">shell_execution</div>
            <div className="text-[10px] text-slate-400">Category: System</div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-crimson-400 font-bold">BLOCK</span>
              <span className="text-crimson-400 text-[10px]">CRITICAL RISK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Violation Audit Stream */}
      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Runtime Policy Violation Audit Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-dark-800 font-mono text-slate-400">
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">AGENT</th>
                <th className="py-3 px-4">ACTION ATTEMPTED</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/60 font-mono">
              {violations.map((v) => (
                <tr key={v.id} className="hover:bg-dark-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {v.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-bold">
                    {v.agent_name || 'Finance Agent'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {v.action_attempted}
                  </td>
                  <td className="py-3 px-4 text-crimson-400 font-bold">
                    {v.status}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(v.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
