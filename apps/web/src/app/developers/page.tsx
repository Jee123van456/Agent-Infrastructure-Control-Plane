import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Terminal, Code2, ArrowRight } from 'lucide-react';

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white mb-6">Developer Experience & Open SDK</h1>
        <p className="text-slate-300 max-w-2xl mx-auto mb-12">
          Designed by AI platform engineers for backend developers. Built on open standards with zero heavy dependencies.
        </p>

        <div className="p-8 rounded-xl bg-dark-900 border border-dark-800 text-left font-mono text-xs space-y-4">
          <div className="text-blue-400 font-bold"># Install open-source Python SDK</div>
          <pre className="p-3 rounded bg-dark-950 text-slate-200">pip install tylerdeck</pre>
          <p className="text-slate-400">Fail-open architecture guarantees that if telemetry servers are unreachable, customer applications operate normally.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
