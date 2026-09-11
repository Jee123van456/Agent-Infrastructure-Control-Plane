import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Activity, ShieldCheck, TrendingDown, Layers, ArrowRight, Cpu, Zap, Database } from 'lucide-react';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <Navbar />

      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
          PRODUCT CAPABILITIES
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          The Full Lifecycle Control Plane for AI Agents
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-12">
          From multi-step trajectory tracing and continuous evaluations to automated version regression detection 
          and tool action policy enforcement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-8 rounded-xl bg-dark-900 border border-dark-800 space-y-4">
            <Activity className="h-8 w-8 text-blue-400" />
            <h3 className="text-xl font-bold text-white">1. Agent Trajectory Observability</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Capture every user query, agent thought, LLM API call, tool execution, and output step-by-step with zero-overhead async batching.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-dark-900 border border-dark-800 space-y-4">
            <TrendingDown className="h-8 w-8 text-amber-400" />
            <h3 className="text-xl font-bold text-white">2. Automated Version Regression Detection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically compare metric deltas across agent releases (v1.4 vs v1.5). Identify tool execution timeouts and cost spikes immediately.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-dark-900 border border-dark-800 space-y-4">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">3. Security & Action Policy Layer</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Define granular permissions per tool (ALLOW, REQUIRE APPROVAL, BLOCK). Prevent unauthorized database modifications and dangerous API invocations.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-dark-900 border border-dark-800 space-y-4">
            <Cpu className="h-8 w-8 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">4. Cost & Model Pricing Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Centralized pricing engine calculates exact USD spend per agent, provider (OpenAI, Anthropic, Gemini), and model version.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <Link href="/dashboard" className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold inline-flex items-center gap-2">
            Explore Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
