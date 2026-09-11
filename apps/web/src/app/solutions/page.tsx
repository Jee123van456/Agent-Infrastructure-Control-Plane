import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Bot, Shield, Code, ArrowRight } from 'lucide-react';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white mb-6">Solutions by Use-Case</h1>
        <p className="text-slate-300 max-w-2xl mx-auto mb-12">
          Tailored AI agent infrastructure observability for Customer Support, Financial Operations, and Autonomous Research.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
            <h3 className="text-lg font-bold text-white">Customer Support AI</h3>
            <p className="text-xs text-slate-400">Detect tool timeouts in order tracking and prevent unapproved refund disbursements.</p>
          </div>

          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
            <h3 className="text-lg font-bold text-white">Financial Execution</h3>
            <p className="text-xs text-slate-400">Enforce strict policy guardrails blocking direct payment API triggers without human sign-off.</p>
          </div>

          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
            <h3 className="text-lg font-bold text-white">Autonomous Research</h3>
            <p className="text-xs text-slate-400">Audit web search tool queries, vector retrieval steps, and document summarization tokens.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
