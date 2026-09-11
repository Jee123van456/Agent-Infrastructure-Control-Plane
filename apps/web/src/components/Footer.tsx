import Link from 'next/link';
import { Activity, Shield, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-800 bg-dark-950 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-white">TYLER<span className="text-blue-500">DECK</span></span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm">
            Observe. Evaluate. Secure. Ship AI Agents.  
            The developer-first infrastructure control plane for small AI startups and production engineering teams.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider font-mono">Product</h4>
          <ul className="space-y-2.5 text-slate-400 text-sm">
            <li><Link href="/product" className="hover:text-white transition-colors">Observability</Link></li>
            <li><Link href="/product" className="hover:text-white transition-colors">Evaluation Engine</Link></li>
            <li><Link href="/product" className="hover:text-white transition-colors">Regression Detection</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">Security Guardrails</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider font-mono">Developers</h4>
          <ul className="space-y-2.5 text-slate-400 text-sm">
            <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            <li><Link href="/docs" className="hover:text-white transition-colors">Python SDK</Link></li>
            <li><Link href="/docs" className="hover:text-white transition-colors">API Reference</Link></li>
            <li><Link href="/developers" className="hover:text-white transition-colors">Quickstart Guide</Link></li>
            <li><Link href="/docs" className="hover:text-white transition-colors">Fail-Open Architecture</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider font-mono">Company</h4>
          <ul className="space-y-2.5 text-slate-400 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">Security Center</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-dark-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 TylerDeck Inc. All rights reserved.</p>
        <p className="font-mono">Built for AI Engineering Teams</p>
      </div>
    </footer>
  );
}
