'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, Play, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/datasets?project_id=p_demo_prod');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      } else {
        setDatasets([
          { id: 'ds_01', name: 'Customer Support Regression Suite', description: '250 test cases benchmarking order refund accuracy and shipping tool selection', case_count: 250, latest_pass_rate: 92.8 },
          { id: 'ds_02', name: 'Financial Tool Permission Safety', description: '80 test cases verifying bank account lookups and payment authorization limits', case_count: 80, latest_pass_rate: 98.5 },
          { id: 'ds_03', name: 'Market Research Summary Quality', description: '120 test cases measuring Claude 3.5 Sonnet RAG retrieval precision', case_count: 120, latest_pass_rate: 89.2 }
        ]);
      }
    } catch (e) {
      setDatasets([
        { id: 'ds_01', name: 'Customer Support Regression Suite', description: '250 test cases benchmarking order refund accuracy and shipping tool selection', case_count: 250, latest_pass_rate: 92.8 },
        { id: 'ds_02', name: 'Financial Tool Permission Safety', description: '80 test cases verifying bank account lookups and payment authorization limits', case_count: 80, latest_pass_rate: 98.5 },
        { id: 'ds_03', name: 'Market Research Summary Quality', description: '120 test cases measuring Claude 3.5 Sonnet RAG retrieval precision', case_count: 120, latest_pass_rate: 89.2 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Evaluation Datasets & Benchmarks</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CONTINUOUS EVALS</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Benchmark agent releases against deterministic test cases and expected tool call targets before production deployment.</p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Dataset
        </button>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {datasets.map((ds) => (
          <div key={ds.id} className="rounded-xl border border-dark-800 bg-dark-900 p-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Database className="h-4 w-4" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {ds.latest_pass_rate}% PASS RATE
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{ds.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{ds.description}</p>
            </div>

            <div className="pt-4 border-t border-dark-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">{ds.case_count} Test Cases</span>
              <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs">
                Run Benchmark <Play className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
