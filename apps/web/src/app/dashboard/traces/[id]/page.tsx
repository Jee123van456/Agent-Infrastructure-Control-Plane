'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Activity, CheckCircle2, AlertTriangle, Clock, DollarSign, 
  Cpu, Database, ShieldCheck, Code2, Layers, ChevronDown, ChevronRight
} from 'lucide-react';

export default function TraceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trace, setTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch(`/api/v1/traces/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setTrace(data);
          if (data.events && data.events.length > 0) {
            setExpandedEvent(data.events[0].id);
          }
        }
      } catch (e) {
        console.error("Error fetching trace detail:", e);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono">Loading trace trajectory...</div>;
  }

  if (!trace) {
    return <div className="p-8 text-crimson-400 font-mono">Trace not found or access denied.</div>;
  }

  const evalScore = trace.evaluations && trace.evaluations.length > 0 ? trace.evaluations[0] : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/traces" 
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Trace Explorer
      </Link>

      {/* Header Metadata Summary Card */}
      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white tracking-tight">{trace.name}</h1>
              {trace.status === 'SUCCESS' && (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  SUCCESS
                </span>
              )}
              {trace.status === 'ERROR' && (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-crimson-500/20 text-crimson-400 border border-crimson-500/30 font-mono">
                  ERROR
                </span>
              )}
              {trace.status === 'POLICY_VIOLATION' && (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                  POLICY VIOLATION
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-slate-400">
              trace_id: <span className="text-slate-200">{trace.trace_id_external}</span> | Agent: <span className="text-white font-bold">{trace.agent_name} ({trace.agent_version})</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 text-center">
              <div className="text-slate-400 text-[10px]">DURATION</div>
              <div className="text-white font-bold text-sm">{Math.round(trace.total_duration_ms)}ms</div>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 text-center">
              <div className="text-slate-400 text-[10px]">TOKENS</div>
              <div className="text-white font-bold text-sm">{trace.total_input_tokens + trace.total_output_tokens}</div>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 text-center">
              <div className="text-slate-400 text-[10px]">COST</div>
              <div className="text-blue-400 font-bold text-sm">${trace.total_cost_usd}</div>
            </div>

            {evalScore && (
              <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 text-center">
                <div className="text-slate-400 text-[10px]">EVAL SCORE</div>
                <div className="text-emerald-400 font-bold text-sm">{evalScore.overall_score}/100</div>
              </div>
            )}
          </div>
        </div>

        {/* Input / Output Snippets */}
        {trace.input_text && (
          <div className="p-3.5 rounded-lg bg-dark-950 border border-dark-800 text-xs font-mono">
            <span className="text-blue-400 font-bold">USER INPUT: </span>
            <span className="text-slate-200">{trace.input_text}</span>
          </div>
        )}

        {trace.output_text && (
          <div className="p-3.5 rounded-lg bg-dark-950 border border-dark-800 text-xs font-mono">
            <span className="text-emerald-400 font-bold">AGENT RESPONSE: </span>
            <span className="text-slate-200">{trace.output_text}</span>
          </div>
        )}

        {trace.error_message && (
          <div className="p-3.5 rounded-lg bg-crimson-500/10 border border-crimson-500/30 text-xs font-mono text-crimson-300">
            <strong className="text-white">FAILURE ERROR DETAILS: </strong> {trace.error_message}
          </div>
        )}
      </div>

      {/* Evaluation Analysis Panel */}
      {evalScore && (
        <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Evaluation Engine Assessment ({evalScore.evaluator_type})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-slate-400 text-[10px]">TASK COMPLETION</div>
              <div className="text-emerald-400 font-bold text-base mt-1">{evalScore.task_completion_score}%</div>
            </div>
            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-slate-400 text-[10px]">TOOL CORRECTNESS</div>
              <div className="text-blue-400 font-bold text-base mt-1">{evalScore.tool_correctness_score}%</div>
            </div>
            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-slate-400 text-[10px]">SAFETY SCORE</div>
              <div className="text-emerald-400 font-bold text-base mt-1">{evalScore.safety_score}%</div>
            </div>
            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-slate-400 text-[10px]">RESPONSE QUALITY</div>
              <div className="text-indigo-400 font-bold text-base mt-1">{evalScore.response_quality_score}%</div>
            </div>
            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-slate-400 text-[10px]">HALLUCINATION RISK</div>
              <div className="text-emerald-400 font-bold text-base mt-1">{evalScore.hallucination_risk_score}%</div>
            </div>
          </div>

          <div className="p-3 rounded bg-dark-950 border border-dark-800 text-xs font-mono text-slate-300">
            <span className="text-slate-400 font-bold">Reasoning: </span>{evalScore.reasoning}
          </div>
        </div>
      )}

      {/* Waterfall Execution Timeline Tree */}
      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          Waterfall Execution Trajectory Timeline
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {trace.events && trace.events.map((ev: any, idx: number) => {
            const isExpanded = expandedEvent === ev.id;
            return (
              <div key={ev.id} className="rounded-lg bg-dark-950 border border-dark-800 overflow-hidden">
                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : ev.id)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-dark-850/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      STEP {idx + 1}
                    </span>

                    <span className="font-bold text-white">{ev.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                    <span>{Math.round(ev.duration_ms)}ms</span>
                    {ev.status === 'SUCCESS' ? (
                      <span className="text-emerald-400 font-bold">SUCCESS</span>
                    ) : (
                      <span className="text-crimson-400 font-bold">FAILURE</span>
                    )}
                  </div>
                </button>

                {/* Expanded Inspection Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-dark-900 border-t border-dark-800 space-y-3 text-slate-300">
                    {ev.llm_call && (
                      <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
                        <div className="text-blue-400 font-bold">LLM CALL METRICS</div>
                        <div>Provider: {ev.llm_call.provider} | Model: {ev.llm_call.model}</div>
                        <div>Prompt Tokens: {ev.llm_call.prompt_tokens} | Completion Tokens: {ev.llm_call.completion_tokens}</div>
                        <div>Cost: ${ev.llm_call.cost_usd}</div>
                      </div>
                    )}

                    {ev.tool_call && (
                      <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
                        <div className="text-emerald-400 font-bold">TOOL EXECUTION RECORD</div>
                        <div>Tool Name: {ev.tool_call.tool_name} ({ev.tool_call.tool_category})</div>
                        <div>Execution Latency: {ev.tool_call.execution_time_ms}ms</div>
                        {ev.tool_call.arguments && (
                          <div className="mt-2">
                            <span className="text-slate-400">Arguments: </span>
                            <pre className="p-2 rounded bg-dark-900 text-[11px] text-slate-200 mt-1 overflow-x-auto">
                              {JSON.stringify(ev.tool_call.arguments, null, 2)}
                            </pre>
                          </div>
                        )}
                        {ev.tool_call.result && (
                          <div className="mt-2">
                            <span className="text-slate-400">Result: </span>
                            <pre className="p-2 rounded bg-dark-900 text-[11px] text-slate-200 mt-1 overflow-x-auto">
                              {JSON.stringify(ev.tool_call.result, null, 2)}
                            </pre>
                          </div>
                        )}
                        {ev.tool_call.error_details && (
                          <div className="mt-2 text-crimson-400">
                            Error Details: {ev.tool_call.error_details}
                          </div>
                        )}
                      </div>
                    )}

                    {ev.inputs && Object.keys(ev.inputs).length > 0 && (
                      <div>
                        <span className="text-slate-400">Inputs: </span>
                        <pre className="p-2.5 rounded bg-dark-950 border border-dark-800 text-[11px] text-slate-200 mt-1 overflow-x-auto">
                          {JSON.stringify(ev.inputs, null, 2)}
                        </pre>
                      </div>
                    )}

                    {ev.outputs && Object.keys(ev.outputs).length > 0 && (
                      <div>
                        <span className="text-slate-400">Outputs: </span>
                        <pre className="p-2.5 rounded bg-dark-950 border border-dark-800 text-[11px] text-slate-200 mt-1 overflow-x-auto">
                          {JSON.stringify(ev.outputs, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
