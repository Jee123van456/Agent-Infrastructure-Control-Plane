'use client';

import { useState, useEffect } from 'react';
import { GitCompare, Plus, CheckCircle2, AlertTriangle, Layers, Clock, DollarSign } from 'lucide-react';

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState<any | null>(null);

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/experiments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExperiments(data);
        if (data.length > 0) setSelectedExp(data[0]);
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
            <GitCompare className="h-5 w-5 text-blue-400" />
            Side-by-Side Candidate Experiments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Run evaluation datasets against candidate prompt versions and LLMs to measure quality, cost, and latency deltas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Experiments ({experiments.length})
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              Loading experiments...
            </div>
          ) : experiments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              No experiment runs recorded.
            </div>
          ) : (
            experiments.map((exp) => {
              const isSelected = selectedExp?.id === exp.id;
              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/40 text-white'
                      : 'bg-dark-900 border-dark-800 hover:border-dark-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{exp.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {exp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{exp.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Dataset: {exp.dataset_name}</span>
                    <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Experiment Detail Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {selectedExp ? (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-6">
              <div className="border-b border-dark-800 pb-4">
                <h2 className="text-base font-bold text-white">{selectedExp.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedExp.description}</p>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedExp.candidates.map((c: any, idx: number) => (
                  <div key={c.id || idx} className="p-4 rounded-xl bg-dark-950 border border-dark-800 space-y-2">
                    <div className="text-xs font-bold text-blue-400 font-mono">{c.label}</div>
                    <div className="text-[11px] text-slate-300 font-mono">Model: {c.model} ({c.provider})</div>
                  </div>
                ))}
              </div>

              {/* Benchmark Results Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Dataset Case Execution Runs ({selectedExp.runs.length})
                </h3>
                <div className="space-y-3">
                  {selectedExp.runs.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-xl bg-dark-950 border border-dark-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 font-mono">{r.candidate_label}</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">Eval Score: {r.evaluation_score}%</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">Query: "{r.input_query}"</div>
                      <div className="p-3 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono text-slate-300 leading-relaxed">
                        {r.output_text}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                        <span>Latency: {r.latency_ms} ms</span>
                        <span>Cost: ${r.cost_usd}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              Select an experiment to compare candidate evaluation scores.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
