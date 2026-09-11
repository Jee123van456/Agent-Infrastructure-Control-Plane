import Link from 'next/link';
import { Activity, ShieldCheck, Cpu, ArrowRight, Terminal } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-dark-800/80 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:border-blue-400 transition-colors">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              TYLER<span className="text-blue-500">DECK</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">Control Plane</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/product" className="hover:text-blue-400 transition-colors">Product</Link>
          <Link href="/solutions" className="hover:text-blue-400 transition-colors">Solutions</Link>
          <Link href="/developers" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <Terminal className="h-3.5 w-3.5 text-blue-400" /> Developers
          </Link>
          <Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
          <Link href="/security" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Security
          </Link>
          <Link href="/docs" className="hover:text-blue-400 transition-colors">Docs</Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            Launch Control Plane
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
