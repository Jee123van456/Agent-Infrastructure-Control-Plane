'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Terminal, CheckCircle, ArrowRight, Copy, Check, ShieldCheck, Zap, 
  Cpu, Server, Key, ArrowLeft, RefreshCw, Activity, AlertCircle
} from 'lucide-react';

function ConnectAgentContent() {
  const searchParams = useSearchParams();

  // Contextual parameters from query strings or defaults
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentVersion, setAgentVersion] = useState('');
  const [apiKey, setApiKey] = useState('');

  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Real Trace Polling State
  const [polling, setPolling] = useState(false);
  const [receivedTrace, setReceivedTrace] = useState<any | null>(null);

  useEffect(() => {
    const projId = searchParams.get('projectId') || searchParams.get('project_id') || '';
    const projName = searchParams.get('project') || searchParams.get('projectName') || 'Production Workspace';
    const env = searchParams.get('environment') || searchParams.get('env') || 'development';
    const agId = searchParams.get('agentId') || searchParams.get('agent_id') || '';
    const agName = searchParams.get('agent') || searchParams.get('agentName') || 'Customer Support Agent';
    const agVer = searchParams.get('version') || searchParams.get('agent_version') || 'v1.0.0';
    const key = searchParams.get('api_key') || searchParams.get('key') || 'td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c';

    setProjectId(projId);
    setProjectName(projName);
    setEnvironment(env);
    setAgentId(agId);
    setAgentName(agName);
    setAgentVersion(agVer);
    setApiKey(key);
  }, [searchParams]);

  // Real Backend Polling for First Trace Arrival
  const pollForRealTrace = async () => {
    setPolling(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch(`http://localhost:8000/api/v1/traces?agent=${encodeURIComponent(agentName)}&limit=1`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const traces = await res.json();
        if (traces && traces.length > 0) {
          setReceivedTrace(traces[0]);
          setStep(6);
          setPolling(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-poll when entering step 5
  useEffect(() => {
    let interval: any = null;
    if (step === 5) {
      pollForRealTrace();
      interval = setInterval(() => {
        pollForRealTrace();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, agentName]);

  const getCodeSnippet = () => {
    return `from tylerdeck import TylerDeck

# 1. Initialize TylerDeck client
td = TylerDeck(
    api_key="${apiKey}",
    endpoint="http://localhost:8000",
    environment="${environment}"
)

# 2. Instrument agent execution trajectory
with td.trace(
    name="${agentName.toLowerCase().replace(/ /g, '_')}_inquiry",
    agent="${agentName}",
    version="${agentVersion}"
) as trace:
    trace.input("Where is my order #ORD-88219?")
    
    # Track LLM completion (${selectedProvider})
    trace.generation(
        provider="${selectedProvider}",
        model="${selectedProvider === 'openai' ? 'gpt-4o' : selectedProvider === 'anthropic' ? 'claude-3-5-sonnet' : 'gemini-1.5-pro'}",
        prompt_tokens=420,
        completion_tokens=85,
        input="Where is my order #ORD-88219?",
        output="Order is IN_TRANSIT"
    )
    
    # Track tool execution
    trace.tool(
        name="order_database_search",
        input={"order_id": "ORD-88219"}
    )
    trace.tool_result(
        name="order_database_search",
        output={"status": "IN_TRANSIT", "eta": "Tomorrow"},
        status="SUCCESS"
    )
    
    trace.output("Your order #ORD-88219 is currently IN_TRANSIT.")

td.shutdown()`;
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Connect Agent to TylerDeck</h1>
            <p className="text-xs text-slate-400 mt-1">Instrument your autonomous agent trajectory in under 3 minutes with zero heavy dependencies.</p>
          </div>

          <Link href={projectId ? `/dashboard/projects/${projectId}` : "/dashboard/projects"} className="px-4 py-2 rounded-lg bg-dark-900 border border-dark-800 text-slate-300 hover:text-white hover:bg-dark-800 text-xs font-medium transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Project
          </Link>
        </div>

        {/* Context Bar */}
        <div className="p-4 rounded-xl bg-dark-900 border border-dark-800 grid grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">PROJECT</div>
            <div className="font-bold text-white truncate">{projectName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">ENVIRONMENT</div>
            <div className="font-bold text-emerald-400 truncate">{environment.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">AGENT</div>
            <div className="font-bold text-blue-400 truncate">{agentName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">VERSION</div>
            <div className="font-bold text-amber-400 truncate">{agentVersion}</div>
          </div>
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
                      <div className="text-xs text-slate-500">Coming soon.</div>
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
                  <Key className="h-4 w-4 text-amber-400" /> Active API Key:
                </div>
                <div className="p-3 rounded bg-dark-900 border border-dark-800 font-mono text-slate-200 flex items-center justify-between">
                  <span>{apiKey}</span>
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
                <p className="text-xs text-slate-400 mt-1">Copy and paste this code snippet into your agent codebase for <strong>{agentName}</strong>.</p>
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
                <h2 className="text-xl font-bold text-white">Step 5: Waiting for First Agent Trace...</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Run your agent code or execute the command line script below to dispatch your first live trace to TylerDeck API.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 max-w-lg mx-auto text-xs font-mono text-slate-300">
                python3 examples/customer_support_agent.py --scenario success
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto text-xs text-amber-400 font-mono flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                <span>Polling backend API for trace from "{agentName}"...</span>
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
                <h2 className="text-2xl font-extrabold text-white">✓ Agent Connected Successfully!</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TylerDeck has recorded your first execution trace in PostgreSQL database.
                </p>
              </div>

              {receivedTrace && (
                <div className="p-5 rounded-xl bg-dark-950 border border-emerald-500/30 max-w-lg mx-auto text-left space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-dark-800 pb-2">
                    <span>STATUS: {receivedTrace.status}</span>
                    <span>{receivedTrace.total_duration_ms} ms</span>
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trace ID:</span>
                      <span className="text-white font-bold">{receivedTrace.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Agent:</span>
                      <span>{receivedTrace.agent_name || agentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Environment:</span>
                      <span className="text-emerald-400">{receivedTrace.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Cost:</span>
                      <span>${receivedTrace.total_cost_usd}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-center gap-4">
                {receivedTrace && (
                  <Link
                    href={`/dashboard/traces/${receivedTrace.id}`}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    View Trace <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href={projectId ? `/dashboard/projects/${projectId}` : "/dashboard/projects"}
                  className="px-6 py-2.5 rounded-lg bg-dark-950 border border-dark-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Go to Agent Dashboard
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

export default function ConnectAgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 text-slate-100 flex items-center justify-center p-12 text-xs font-mono text-slate-400">
        Loading connection setup context...
      </div>
    }>
      <ConnectAgentContent />
    </Suspense>
  );
}
