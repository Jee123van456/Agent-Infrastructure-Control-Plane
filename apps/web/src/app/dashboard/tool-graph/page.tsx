'use client';

import { useState, useEffect } from 'react';
import { Network, ShieldAlert, Cpu, CheckCircle, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function ToolGraphPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/tool-graph');
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
      } else {
        // Fallback demo data
        setGraphData({
          nodes: [
            { id: 'agent', label: 'Agent Core', type: 'agent', risk: 'LOW' },
            { id: 'tool_order_database_search', label: 'order_database_search', type: 'tool', category: 'database', risk: 'LOW' },
            { id: 'tool_shipping_carrier_api', label: 'shipping_carrier_api', type: 'tool', category: 'api', risk: 'MEDIUM' },
            { id: 'tool_payment_disbursement', label: 'payment_disbursement', type: 'tool', category: 'payment', risk: 'HIGH' },
            { id: 'tool_vector_knowledge_search', label: 'vector_knowledge_search', type: 'tool', category: 'search', risk: 'LOW' }
          ],
          edges: [
            { source: 'agent', target: 'tool_order_database_search', call_count: 1420, failure_rate_percent: 1.2, avg_latency_ms: 185.0 },
            { source: 'agent', target: 'tool_shipping_carrier_api', call_count: 890, failure_rate_percent: 6.4, avg_latency_ms: 420.0 },
            { source: 'agent', target: 'tool_payment_disbursement', call_count: 120, failure_rate_percent: 14.8, avg_latency_ms: 850.0 },
            { source: 'agent', target: 'tool_vector_knowledge_search', call_count: 2150, failure_rate_percent: 0.4, avg_latency_ms: 95.0 }
          ],
          total_tools_connected: 4
        });
      }
    } catch (err) {
      setGraphData({
        nodes: [
          { id: 'agent', label: 'Agent Core', type: 'agent', risk: 'LOW' },
          { id: 'tool_order_database_search', label: 'order_database_search', type: 'tool', category: 'database', risk: 'LOW' },
          { id: 'tool_shipping_carrier_api', label: 'shipping_carrier_api', type: 'tool', category: 'api', risk: 'MEDIUM' },
          { id: 'tool_payment_disbursement', label: 'payment_disbursement', type: 'tool', category: 'payment', risk: 'HIGH' },
          { id: 'tool_vector_knowledge_search', label: 'vector_knowledge_search', type: 'tool', category: 'search', risk: 'LOW' }
        ],
        edges: [
          { source: 'agent', target: 'tool_order_database_search', call_count: 1420, failure_rate_percent: 1.2, avg_latency_ms: 185.0 },
          { source: 'agent', target: 'tool_shipping_carrier_api', call_count: 890, failure_rate_percent: 6.4, avg_latency_ms: 420.0 },
          { source: 'agent', target: 'tool_payment_disbursement', call_count: 120, failure_rate_percent: 14.8, avg_latency_ms: 850.0 },
          { source: 'agent', target: 'tool_vector_knowledge_search', call_count: 2150, failure_rate_percent: 0.4, avg_latency_ms: 95.0 }
        ],
        total_tools_connected: 4
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Agent Tool Relationship Graph</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">VISUAL RELATIONSHIPS</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Interactive invocation flow, latency, failure rates, and risk classification across connected agent tools.</p>
        </div>
        <button
          onClick={fetchGraph}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-800 text-xs font-semibold text-slate-200 hover:bg-dark-850 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Graph
        </button>
      </div>

      {/* Main Visual Canvas Container */}
      <div className="rounded-xl border border-dark-800 bg-dark-900/80 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-white">Live Execution Topology</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> LOW RISK
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> MEDIUM RISK
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-crimson-400" /> HIGH RISK
            </span>
          </div>
        </div>

        {/* Node & Edge Diagram Layout */}
        <div className="relative min-h-[380px] bg-dark-950/60 rounded-xl border border-dark-800/80 p-8 flex items-center justify-between gap-12 overflow-x-auto">
          
          {/* Central Agent Node */}
          <div className="flex-shrink-0 relative group">
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-900/40 to-dark-900 border-2 border-blue-500/60 flex flex-col items-center justify-center p-4 text-center shadow-lg shadow-blue-500/10">
              <Cpu className="h-8 w-8 text-blue-400 mb-2 animate-pulse" />
              <div className="font-bold text-white text-xs">AGENT CORE</div>
              <div className="text-[10px] text-blue-400 font-mono mt-1">Autonomous Host</div>
            </div>
          </div>

          {/* Connected Tool Nodes */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {graphData?.edges?.map((edge: any) => {
              const toolName = edge.target.replace('tool_', '');
              const isHighRisk = edge.failure_rate_percent > 10.0;
              return (
                <div 
                  key={edge.target} 
                  className={`p-4 rounded-xl border transition-all ${
                    isHighRisk 
                      ? 'bg-crimson-500/10 border-crimson-500/40 hover:border-crimson-400' 
                      : 'bg-dark-900 border-dark-800 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-4 w-4 ${isHighRisk ? 'text-crimson-400' : 'text-blue-400'}`} />
                      <span className="font-mono text-xs font-bold text-white">{toolName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                      isHighRisk ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {edge.failure_rate_percent}% FAIL
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-dark-800 text-[11px] font-mono">
                    <div>
                      <div className="text-slate-400 text-[9px]">CALLS</div>
                      <div className="text-white font-semibold">{edge.call_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px]">AVG LATENCY</div>
                      <div className="text-white font-semibold">{edge.avg_latency_ms}ms</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px]">STATUS</div>
                      <div className={isHighRisk ? 'text-crimson-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {isHighRisk ? 'WARN' : 'HEALTHY'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
