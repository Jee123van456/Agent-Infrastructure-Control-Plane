import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Key, CheckCircle2 } from 'lucide-react';

export default function SecurityOverviewPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
          SECURITY-FIRST INFRASTRUCTURE
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-6">Security & Data Privacy Standard</h1>
        <p className="text-slate-300 max-w-2xl mx-auto mb-12">
          Automatic secret redaction, SHA-256 API key hashing, tenant isolation, and zero raw credential logging by default.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
            <Lock className="h-6 w-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">SDK PII & Key Redaction</h3>
            <p className="text-xs text-slate-400">Redacts Bearer tokens, OpenAI keys (`sk-...`), credit card numbers, and SSNs before leaving customer environment.</p>
          </div>

          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
            <Key className="h-6 w-6 text-blue-400" />
            <h3 className="text-base font-bold text-white">SHA-256 API Key Storage</h3>
            <p className="text-xs text-slate-400">API keys are stored as one-way SHA-256 hashes. Plaintext keys are never readable on TylerDeck servers.</p>
          </div>

          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Strict Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400">Database queries enforce strict organization UUID scoping. One organization can never access another's telemetry.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
