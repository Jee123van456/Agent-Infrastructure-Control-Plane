'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Activity, ShieldCheck, Zap, Layers, AlertTriangle, ArrowRight, CheckCircle2, 
  Terminal, Cpu, Code2, Database, Lock, TrendingDown, Clock, DollarSign
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'regression' | 'security'>('timeline');

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden border-b border-dark-800/60">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-8">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            TYLERDECK 1.0 — THE PRODUCTION CONTROL PLANE FOR AI AGENTS
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Make AI Agents Reliable <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              In Production.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Observe every agent execution trajectory, evaluate tool-use correctness, detect version regressions, 
            isolate failure root causes, and enforce runtime security policies — all from one developer-first control plane.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-base"
            >
              Start Building Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/docs"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 font-semibold transition-all flex items-center justify-center gap-2 text-base"
            >
              <Terminal className="h-5 w-5 text-blue-400" />
              View Documentation
            </Link>
          </div>

          {/* Key Value Pill Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left font-mono text-xs text-slate-300">
            <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-800 flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span>5-Min Integration</span>
            </div>
            <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-800 flex items-center gap-2.5">
              <TrendingDown className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>Regression Detection</span>
            </div>
            <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-800 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Tool Policy Guardrails</span>
            </div>
            <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-800 flex items-center gap-2.5">
              <DollarSign className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              <span>Cost Intelligence</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Control Plane Demo Visualizer */}
      <section className="py-16 px-6 bg-dark-950 border-b border-dark-800/60">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Live Execution Control Plane</h2>
              <p className="text-sm text-slate-400">Real-time inspection of multi-step agent thoughts, LLM calls, tool executions, and security policies.</p>
            </div>

            <div className="flex items-center gap-2 bg-dark-900 p-1.5 rounded-lg border border-dark-800 text-xs font-medium font-mono">
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Execution Timeline
              </button>
              <button 
                onClick={() => setActiveTab('regression')}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'regression' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Version Diff (v1.4 vs v1.5)
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Tool Policy Audit
              </button>
            </div>
          </div>

          {/* Interactive Demo Box */}
          <div className="rounded-xl bg-dark-900 border border-dark-800 overflow-hidden shadow-2xl">
            
            {/* Window Bar */}
            <div className="px-4 py-3 bg-dark-850 border-b border-dark-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-crimson-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-slate-300">trace_id: tr_82941_prod</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Agent: <strong className="text-white">Customer Support Agent (v1.5)</strong></span>
                <span>Latency: <strong className="text-emerald-400">4.82s</strong></span>
                <span>Cost: <strong className="text-blue-400">$0.018</strong></span>
              </div>
            </div>

            {/* Tab 1: Execution Timeline */}
            {activeTab === 'timeline' && (
              <div className="p-6 space-y-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 flex items-start gap-3">
                  <div className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">1. INPUT</div>
                  <div>
                    <span className="text-slate-400">User Query: </span>
                    <span className="text-white font-semibold">"Where is my order #ORD-9912 and can I issue a refund?"</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 flex items-start gap-3">
                  <div className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">2. LLM</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Model: <strong className="text-white">OpenAI / gpt-4o</strong></span>
                      <span>Tokens: 1,420 in / 180 out | Latency: 620ms</span>
                    </div>
                    <p className="text-slate-300 italic">"Determined intent: Search order database to check shipping status before evaluating refund criteria."</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 flex items-start gap-3">
                  <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">3. TOOL</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">customer_db_search({"{"} order_id: "ORD-9912" {"}"})</span>
                      <span className="text-emerald-400 font-bold">Status: SUCCESS (180ms)</span>
                    </div>
                    <div className="p-2 rounded bg-dark-900 border border-dark-800 text-[11px] text-slate-300">
                      Result: {"{"} "status": "delivered", "delivered_date": "2026-09-10", "eligible_for_refund": true {"}"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-dark-950 border border-crimson-500/30 flex items-start gap-3">
                  <div className="px-2 py-0.5 rounded bg-crimson-500/20 text-crimson-400 font-bold">4. POLICY</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-crimson-400 font-bold">SECURITY POLICY CHECK: refund_processor</span>
                      <span className="text-crimson-400 font-bold">POLICY: REQUIRE APPROVAL</span>
                    </div>
                    <p className="text-slate-300">Attempted automatic refund execution &gt; $50. Paused trace for human supervisor sign-off.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Version Regression Diff */}
            {activeTab === 'regression' && (
              <div className="p-6 font-mono text-xs space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">REGRESSION DETECTED IN VERSION 1.5</strong>
                    <p className="text-xs text-amber-200/80">Success rate dropped 12.1% after upgrading model to gpt-4o with new multi-tool prompts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-dark-950 border border-dark-800">
                    <div className="text-xs text-slate-400 mb-2">Baseline Version (v1.4)</div>
                    <div className="text-2xl font-bold text-emerald-400 mb-1">94.2% Success</div>
                    <div className="text-xs text-slate-400">Avg Latency: 2.1s | Cost/Run: $0.012</div>
                  </div>

                  <div className="p-4 rounded-lg bg-dark-950 border border-crimson-500/40">
                    <div className="text-xs text-slate-400 mb-2">Current Release (v1.5)</div>
                    <div className="text-2xl font-bold text-crimson-400 mb-1">82.1% Success (-12.1%)</div>
                    <div className="text-xs text-slate-400">Avg Latency: 4.8s (+128%) | Cost/Run: $0.038 (+216%)</div>
                  </div>
                </div>

                <div className="p-3 rounded bg-dark-950 border border-dark-800 text-slate-300">
                  <strong className="text-blue-400">Contributing Root Cause Factor:</strong> 73% of v1.5 failures are associated with database query tool timeouts exceeding 5000ms after prompt modification.
                </div>
              </div>
            )}

            {/* Tab 3: Security & Tool Audit */}
            {activeTab === 'security' && (
              <div className="p-6 font-mono text-xs space-y-3">
                <div className="text-slate-400 mb-2">Active Agent Tool Permissions & Risk Levels:</div>

                <div className="p-3 rounded bg-dark-950 border border-dark-800 flex items-center justify-between">
                  <span className="text-white font-semibold">customer_db_search</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">ALLOW (LOW RISK)</span>
                </div>

                <div className="p-3 rounded bg-dark-950 border border-dark-800 flex items-center justify-between">
                  <span className="text-white font-semibold">payment_api</span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-bold">REQUIRE APPROVAL (HIGH RISK)</span>
                </div>

                <div className="p-3 rounded bg-dark-950 border border-dark-800 flex items-center justify-between">
                  <span className="text-white font-semibold">shell_execution</span>
                  <span className="px-2.5 py-1 rounded bg-crimson-500/20 text-crimson-400 font-bold">BLOCK (CRITICAL RISK)</span>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Problem & Whitespace Section */}
      <section className="py-20 px-6 bg-dark-950 border-b border-dark-800/60">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Telemetry is Not Enough. <br />
              You Need Engineering Intelligence.
            </h2>
            <p className="text-slate-300 text-base">
              Existing LLM tools expose raw logs and flame graphs. TylerDeck analyzes execution trajectories 
              to give you direct root-cause answers when production agents fail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl bg-dark-900/60 border border-crimson-500/20 flex flex-col gap-4">
              <div className="h-10 w-10 rounded-lg bg-crimson-500/10 border border-crimson-500/30 flex items-center justify-center text-crimson-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Traditional LLM Logging</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                "Here are 10,000 raw log traces. Figure out which prompt change or tool call caused your error rate to spike."
              </p>
              <ul className="space-y-2 text-xs text-slate-400 font-mono pt-4 border-t border-dark-800">
                <li className="flex items-center gap-2"><span className="text-crimson-400">✕</span> Manual log digging through unstructured spans</li>
                <li className="flex items-center gap-2"><span className="text-crimson-400">✕</span> No automated version regression detection</li>
                <li className="flex items-center gap-2"><span className="text-crimson-400">✕</span> No tool permission guardrails or policy checks</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-dark-900 border border-blue-500/30 flex flex-col gap-4 shadow-xl">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white">The TylerDeck Control Plane</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                "Agent success rate dropped 12.1% after version 1.5. 73% of failures are associated with database search tool timeouts."
              </p>
              <ul className="space-y-2 text-xs text-slate-200 font-mono pt-4 border-t border-dark-800">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Automated version regression diff highlights</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Failure clustering & root cause identification</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Built-in tool action policies (ALLOW, REQUIRE APPROVAL, BLOCK)</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Developer Quickstart Code Section */}
      <section className="py-20 px-6 bg-dark-950 border-b border-dark-800/60">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4">
                DEVELOPER EXPERIENCE
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-4">
                First Trace in Under 5 Minutes.
              </h2>
              <p className="text-slate-300 text-base mb-6 leading-relaxed">
                Install our non-blocking Python SDK with zero heavy dependencies. Your production agent traffic 
                is never delayed thanks to our fail-open background queue architecture.
              </p>

              <div className="space-y-4 text-sm font-medium text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">1</div>
                  <span>Install via PyPI: <code className="px-2 py-0.5 rounded bg-dark-900 text-blue-400 font-mono">pip install tylerdeck</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">2</div>
                  <span>Initialize client with API key: <code className="px-2 py-0.5 rounded bg-dark-900 text-blue-400 font-mono">td = TylerDeck(api_key="td_live_...")</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">3</div>
                  <span>Wrap agent function with <code className="px-2 py-0.5 rounded bg-dark-900 text-blue-400 font-mono">@td.trace</code> or context manager</span>
                </div>
              </div>
            </div>

            {/* Code Box */}
            <div className="rounded-xl bg-dark-900 border border-dark-800 overflow-hidden shadow-2xl">
              <div className="px-4 py-3 bg-dark-850 border-b border-dark-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>agent_workflow.py</span>
                <span className="text-emerald-400">Python 3.10+</span>
              </div>
              <pre className="p-5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
{`from tylerdeck import TylerDeck

td = TylerDeck(api_key="td_live_9f8a3c4b1e5d6...")

# Decorator pattern for fast setup
@td.trace(name="support_agent", agent_id="agent_123", version="v1.5")
def my_agent(user_query: str):
    # Log internal LLM calls explicitly
    td.log_llm_call(
        provider="openai",
        model="gpt-4o",
        prompt_tokens=1420,
        completion_tokens=310
    )
    
    # Log tool executions & latency
    td.log_tool_call(
        tool_name="order_database_search",
        arguments={"order_id": "ORD-9912"},
        result={"status": "delivered"},
        execution_time_ms=180.5
    )
    
    return "Your order #ORD-9912 has been delivered."`}
              </pre>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-950 to-dark-900 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Ready to Take Control of Your Production AI Agents?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join AI startups using TylerDeck for real-time agent visibility, continuous evaluation, and version regression detection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              Open TylerDeck Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
