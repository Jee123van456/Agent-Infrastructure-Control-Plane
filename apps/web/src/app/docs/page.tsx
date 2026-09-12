import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Terminal, Check, Code2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="space-y-4 text-xs font-mono text-slate-400">
          <div className="font-bold text-white uppercase tracking-wider">Quickstart</div>
          <ul className="space-y-2 border-l border-dark-800 pl-3">
            <li className="text-blue-400 font-semibold"><a href="#quickstart">5-Minute Integration Guide</a></li>
            <li><a href="#installation" className="hover:text-white">Python SDK Installation</a></li>
            <li><a href="#api-key" className="hover:text-white">API Key Generation</a></li>
          </ul>

          <div className="font-bold text-white uppercase tracking-wider pt-4">SDK Reference</div>
          <ul className="space-y-2 border-l border-dark-800 pl-3">
            <li><a href="#decorator" className="hover:text-white">@td.trace Decorator</a></li>
            <li><a href="#context-manager" className="hover:text-white">Context Manager</a></li>
            <li><a href="#fail-open" className="hover:text-white">Fail-Open Architecture</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3 space-y-10">
          
          <section id="quickstart">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4">
              5-MINUTE QUICKSTART
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4">TylerDeck Developer Documentation</h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Connect your Python AI agent application to the TylerDeck control plane in under 5 minutes with zero heavy dependencies.
            </p>

            <div className="space-y-6">
              
              <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono">Step 1: Install Python SDK</h3>
                <pre className="p-3 rounded bg-dark-950 text-xs text-blue-400 font-mono">
                  pip install tylerdeck
                </pre>
              </div>

              <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono">Step 2: Add 3 Lines of Instrumentation</h3>
                <pre className="p-4 rounded bg-dark-950 text-xs text-slate-200 font-mono leading-relaxed overflow-x-auto">
{`from tylerdeck import TylerDeck

# 1. Initialize client with your project API key
td = TylerDeck(api_key="td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c")

# 2. Add trace decorator to your agent execution function
@td.trace(name="customer_support_flow", agent_id="support_agent", version="v1.5")
def run_agent(query: str):
    # Log intermediate LLM call
    td.log_llm_call(
        provider="openai",
        model="gpt-4o",
        prompt_tokens=1420,
        completion_tokens=310
    )
    
    # Log tool execution
    td.log_tool_call(
        tool_name="customer_db_search",
        arguments={"order_id": "ORD-9912"},
        result={"status": "delivered"},
        execution_time_ms=180.0
    )
    
    return "Your order #ORD-9912 has been delivered."`}
                </pre>
              </div>

              <div className="p-5 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono">Step 3: Open Dashboard</h3>
                <p className="text-xs text-slate-300">
                  Execute your agent. The trace will appear instantly in your <Link href="/dashboard/traces" className="text-blue-400 hover:underline">Trace Explorer</Link>!
                </p>
              </div>

            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
