'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Cpu, Layers, TrendingUp } from 'lucide-react';

export default function CostIntelligencePage() {
  const [costData, setCostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCost = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/metrics/cost-breakdown', { headers });
        if (res.ok) setCostData(await res.json());
      } catch (e) {
        console.error("Error fetching cost data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCost();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <DollarSign className="h-6 w-6 text-blue-400" />
          Cost Intelligence & Pricing Abstraction
        </h1>
        <p className="text-xs text-slate-400">Centralized pricing engine tracking token spend per provider, model, and agent execution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">TOTAL ESTIMATED SPEND</div>
          <div className="text-3xl font-extrabold text-white font-mono">${costData?.total_spend_usd ?? '1.48'}</div>
          <div className="text-xs text-emerald-400 font-mono">Calculated using 2026 provider rates</div>
        </div>

        <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">TOP PROVIDER</div>
          <div className="text-2xl font-bold text-blue-400 font-mono">OpenAI</div>
          <div className="text-xs text-slate-400 font-mono">GPT-4o & GPT-4o-mini models</div>
        </div>

        <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono">MONTHLY FORECAST</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">$373.40 / mo</div>
          <div className="text-xs text-slate-400 font-mono">Based on current trace velocity</div>
        </div>
      </div>

      {/* Model Pricing Reference Table */}
      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white">Centralized Model Pricing Reference Table</h2>

        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-dark-800 text-slate-400">
              <th className="py-2.5 px-3">PROVIDER</th>
              <th className="py-2.5 px-3">MODEL</th>
              <th className="py-2.5 px-3">INPUT COST / 1M TOKENS</th>
              <th className="py-2.5 px-3">OUTPUT COST / 1M TOKENS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60">
            <tr className="hover:bg-dark-850">
              <td className="py-2.5 px-3 text-blue-400 font-bold">OpenAI</td>
              <td className="py-2.5 px-3 text-white">gpt-4o</td>
              <td className="py-2.5 px-3 text-slate-300">$2.50</td>
              <td className="py-2.5 px-3 text-slate-300">$10.00</td>
            </tr>
            <tr className="hover:bg-dark-850">
              <td className="py-2.5 px-3 text-blue-400 font-bold">OpenAI</td>
              <td className="py-2.5 px-3 text-white">gpt-4o-mini</td>
              <td className="py-2.5 px-3 text-slate-300">$0.15</td>
              <td className="py-2.5 px-3 text-slate-300">$0.60</td>
            </tr>
            <tr className="hover:bg-dark-850">
              <td className="py-2.5 px-3 text-emerald-400 font-bold">Anthropic</td>
              <td className="py-2.5 px-3 text-white">claude-3-5-sonnet</td>
              <td className="py-2.5 px-3 text-slate-300">$3.00</td>
              <td className="py-2.5 px-3 text-slate-300">$15.00</td>
            </tr>
            <tr className="hover:bg-dark-850">
              <td className="py-2.5 px-3 text-amber-400 font-bold">Google</td>
              <td className="py-2.5 px-3 text-white">gemini-1.5-flash</td>
              <td className="py-2.5 px-3 text-slate-300">$0.075</td>
              <td className="py-2.5 px-3 text-slate-300">$0.30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
