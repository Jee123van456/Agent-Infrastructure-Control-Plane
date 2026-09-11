import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <Navbar />

      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4">
          TRANSPARENT PRICING FOR AI STARTUPS
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Predictable Pricing that Scales with Value
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-16">
          No hidden seat fees. No artificial feature gating. Built specifically for AI teams from 2 to 50 employees.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          
          {/* Developer */}
          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Developer</h3>
              <p className="text-xs text-slate-400 mb-4">For solo founders and side projects.</p>
              <div className="text-3xl font-extrabold text-white mb-4">$0 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 10,000 Traces / month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 14-day Data Retention</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 1 Project & 2 Agents</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Basic Observability</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white font-medium text-xs text-center transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-xl bg-dark-900 border-2 border-blue-500 relative flex flex-col justify-between shadow-2xl shadow-blue-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold tracking-wider text-white uppercase font-mono">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
              <p className="text-xs text-slate-400 mb-4">For growing AI startups in production.</p>
              <div className="text-3xl font-extrabold text-white mb-4">$49 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
              <ul className="space-y-2.5 text-xs text-slate-200 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 100,000 Traces / month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 90-day Data Retention</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Unlimited Projects & Seats</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Version Regression Engine</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Security Action Policies</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs text-center transition-colors shadow-lg shadow-blue-600/20">
              Start 14-Day Trial
            </Link>
          </div>

          {/* Team */}
          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Team</h3>
              <p className="text-xs text-slate-400 mb-4">For high-throughput AI engineering teams.</p>
              <div className="text-3xl font-extrabold text-white mb-4">$199 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 500,000 Traces / month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 1-Year Data Retention</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Priority Ingestion Queues</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Custom Alert Webhooks</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white font-medium text-xs text-center transition-colors">
              Upgrade to Team
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Enterprise</h3>
              <p className="text-xs text-slate-400 mb-4">Self-hosted, VPC, and dedicated clusters.</p>
              <div className="text-3xl font-extrabold text-white mb-4">Custom</div>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Unlimited Traces & Data</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Self-Hosted Docker / Helm</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> SAML SSO & Dedicated Support</li>
              </ul>
            </div>
            <Link href="/security" className="w-full py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white font-medium text-xs text-center transition-colors">
              Contact Sales
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
