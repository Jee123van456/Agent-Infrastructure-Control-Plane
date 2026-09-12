'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Terminal, CheckCircle, ArrowRight, Copy, Check, ShieldCheck, Zap, 
  Cpu, Server, Key, ArrowLeft, RefreshCw, Activity
} from 'lucide-react';

export default function ConnectAgentPage() {
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const demoApiKey = "td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c";

  const getCodeSnippet = () => {
    return `from tylerdeck import TylerDeck

# 1. Initialize TylerDeck client
td = TylerDeck(
    api_key="${demoApiKey}",
    endpoint="http://localhost:8000"
)

# 2. Instrument agent execution trajectory
with td.trace(
    name="customer_support_inquiry",
    agent="Customer Support Agent",
    version="v1.0"
) as trace:
    trace.log_input("Where is my order #ORD-88219?")
    
    # Track LLM completion (${selectedProvider})
    trace.llm_call(
        provider="${selectedProvider}",
        model="${selectedProvider === 'openai' ? 'gpt-4o' : selectedProvider === 'anthropic' ? 'claude-3-5-sonnet' : 'gemini-1.5-pro'}",
        prompt_tokens=420,
        completion_tokens=85
    )
    
    # Track tool execution
    trace.tool_call(
        name="order_database_search",
        tool_category="database",
        arguments={"order_id": "ORD-88219"},
        result={"status": "IN_TRANSIT", "eta": "Tomorrow"},
        execution_time_ms=180.0
    )
    
    trace.log_output("Your order #ORD-88219 is currently IN_TRANSIT.")

td.shutdown()`;
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(demoApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulateTestTrace = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setStep(6);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-dark-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-2">
              <Zap className="h-3.5 w-3.5" /> AGENT CONNECTION WIZARD
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Connect Your First AI Agent</h1>
            <p className="text-xs text-slate-400 mt-1">Instrument your autonomous agent trajectory in under 3 minutes with zero heavy dependencies.</p>
          </div>

          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-dark-900 border border-dark-800 text-slate-300 hover:text-white hover:bg-dark-800 text-xs font-medium transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>

        {/* Wizard Progress Steps Bar */}
        <div className="grid grid-cols-6 gap-2">
          {[
            { num: 1, label: 'Language' },
            { num: 2, label: 'Provider' },
            { num: 3, label: 'Install' },
            { num: 4, label: 'Instrument' },
            { num: 5, label: 'Test Trace' },
            { num: 6, label: 'Confirmed' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => s.num <= step && setStep(s.num)}
              className={`p-3 rounded-lg border text-left transition-all ${
                step === s.num
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : s.num < step
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-dark-900 border-dark-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider">Step 0{s.num}</div>
              <div className="text-xs font-bold font-mono mt-0.5 truncate">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Wizard Step Content Box */}
        <div className="p-8 rounded-2xl bg-dark-900 border border-dark-800 space-y-6 shadow-2xl">
          
          {/* Step 1: Language */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Step 1: Choose Your Agent Language SDK</h2>
                <p className="text-xs text-slate-400 mt-1">TylerDeck provides lightweight non-blocking telemetry SDKs for AI applications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedLanguage('python')}
                  className={`p-5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedLanguage === 'python'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-dark-950 border-dark-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-lg">Py</div>
                    <div>
                      <div className="font-bold text-sm text-white">Python SDK (`tylerdeck`)</div>
                      <div className="text-xs text-slate-400">Supports Python 3.9+ with async background exporter.</div>
                    </div>
                  </div>
                  {selectedLanguage === 'python' && <CheckCircle className="h-5 w-5 text-blue-400" />}
                </button>

                <div className="p-5 rounded-xl border border-dark-800 bg-dark-950/50 text-slate-500 opacity-60 flex items-center justify-between cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-dark-900 font-mono font-bold text-lg text-slate-600">TS</div>
                    <div>
                      <div className="font-bold text-sm text-slate-400">TypeScript / Node.js</div>
                      <div className="text-xs text-slate-500">Coming soon in Module 02.</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-500">SOON</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-dark-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  Continue to Provider Selection <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Provider */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Step 2: Choose Primary LLM Provider</h2>
                <p className="text-xs text-slate-400 mt-1">TylerDeck normalizes telemetry and calculates cost across OpenAI, Anthropic, Gemini, and custom providers.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, o1, o3-mini' },
                  { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3.5 Sonnet, Haiku' },
                  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5 Pro, Flash' },
                  { id: 'custom', name: 'Custom LLM', desc: 'Self-hosted vLLM / Ollama' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProvider(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedProvider === p.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-dark-950 border-dark-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-white mb-1">{p.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{p.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-dark-800">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-dark-950 text-slate-400 hover:text-white text-xs font-medium">Back</button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  Continue to SDK Installation <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Install */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Step 3: Install the TylerDeck Python SDK</h2>
                <p className="text-xs text-slate-400 mt-1">Run this command in your Python virtual environment.</p>
              </div>

              <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 flex items-center justify-between font-mono text-sm text-blue-400">
                <span>pip install tylerdeck</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('pip install tylerdeck');
                  }}
                  className="px-3 py-1.5 rounded bg-dark-900 hover:bg-dark-800 text-slate-300 text-xs flex items-center gap-1.5 border border-dark-800"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>

              <div className="p-4 rounded-xl bg-dark-950/80 border border-dark-800 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white font-mono flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-400" /> Project API Key Generated:
                </div>
                <div className="p-3 rounded bg-dark-900 border border-dark-800 font-mono text-slate-200 flex items-center justify-between">
                  <span>{demoApiKey}</span>
                  <button onClick={handleCopyKey} className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]">
                    {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-dark-800">
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-dark-950 text-slate-400 hover:text-white text-xs font-medium">Back</button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  Continue to Code Instrumentation <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Instrument */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Step 4: Instrument Your Agent Execution</h2>
                <p className="text-xs text-slate-400 mt-1">Copy and paste this snippet into your AI agent application.</p>
              </div>

              <div className="relative">
                <pre className="p-5 rounded-xl bg-dark-950 border border-dark-800 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-96">
                  {getCodeSnippet()}
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy Snippet'}</span>
                </button>
              </div>

              <div className="flex justify-between pt-4 border-t border-dark-800">
                <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg bg-dark-950 text-slate-400 hover:text-white text-xs font-medium">Back</button>
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  Proceed to Test Trace Verification <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Test Trace */}
          {step === 5 && (
            <div className="space-y-6 text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="h-8 w-8 animate-pulse" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl font-bold text-white">Step 5: Send First Agent Test Trace</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Run your agent code or click below to trigger a simulated test trace to TylerDeck API.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 max-w-lg mx-auto text-xs font-mono text-slate-300">
                python3 examples/customer_support_agent.py --scenario success
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={handleSimulateTestTrace}
                  disabled={verifying}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Trace Arrival...
                    </>
                  ) : (
                    <>
                      Verify Test Trace Arrival <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Confirmed */}
          {step === 6 && (
            <div className="space-y-6 text-center py-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="h-10 w-10" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-2xl font-extrabold text-white">Your First AI Agent is Connected!</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TylerDeck has successfully recorded your first execution trajectory, token metrics, and evaluation scores.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-dark-950 border border-emerald-500/30 max-w-lg mx-auto text-left space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-dark-800 pb-2">
                  <span>STATUS: CONNECTED & RECORDED</span>
                  <span>100 / 100</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Key Prefix:</span>
                    <span>td_test_9f8a3c4b</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agent Detected:</span>
                    <span>Customer Support Agent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">First Version:</span>
                    <span>v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trace ID:</span>
                    <span>tr_support_demo_101</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <Link
                  href="/dashboard/traces"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  View Traces in Explorer <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-lg bg-dark-950 border border-dark-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Open Command Center
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
