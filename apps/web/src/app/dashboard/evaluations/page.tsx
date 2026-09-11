'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Star, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

export default function EvaluationsPage() {
  const [evals, setEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvals = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/evaluations', { headers });
        if (res.ok) setEvals(await res.json());
      } catch (e) {
        console.error("Error fetching evaluations:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvals();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          Agent Evaluation Framework
        </h1>
        <p className="text-xs text-slate-400">Continuous scoring across 6 key metrics: Task Completion, Tool Correctness, Safety, Response Quality, and Hallucination Risk.</p>
      </div>

      <div className="rounded-xl bg-dark-900 border border-dark-800 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-dark-800 bg-dark-850/50 text-slate-400">
              <th className="py-3 px-4">TRACE & AGENT</th>
              <th className="py-3 px-4">OVERALL SCORE</th>
              <th className="py-3 px-4">TASK COMPLETION</th>
              <th className="py-3 px-4">TOOL CORRECTNESS</th>
              <th className="py-3 px-4">SAFETY SCORE</th>
              <th className="py-3 px-4">HALLUCINATION RISK</th>
              <th className="py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60">
            {evals.map((e) => (
              <tr key={e.id} className="hover:bg-dark-850/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="text-slate-200 font-bold">{e.trace_name}</div>
                  <div className="text-[10px] text-slate-500">{e.evaluator_type}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-emerald-400 font-bold text-sm">{e.overall_score}/100</span>
                </td>
                <td className="py-3 px-4 text-slate-300">{e.task_completion_score}%</td>
                <td className="py-3 px-4 text-slate-300">{e.tool_correctness_score}%</td>
                <td className="py-3 px-4 text-slate-300">{e.safety_score}%</td>
                <td className="py-3 px-4 text-slate-300">{e.hallucination_risk_score}%</td>
                <td className="py-3 px-4">
                  <Link href={`/dashboard/traces/${e.trace_id}`} className="text-blue-400 hover:underline">
                    Inspect Trace
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
