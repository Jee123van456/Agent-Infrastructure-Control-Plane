'use client';

import { useState } from 'react';
import { Key, Copy, Check, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function APIKeysPage() {
  const [copied, setCopied] = useState(false);
  const rawTestKey = "td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c";

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTestKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Key className="h-6 w-6 text-blue-400" />
            API Key Management
          </h1>
          <p className="text-xs text-slate-400">Generate, view, and rotate secure API keys used by the TylerDeck Python/TS SDKs.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2">
          <Plus className="h-4 w-4" /> Generate New API Key
        </button>
      </div>

      {/* Primary Key Box */}
      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Production SDK Key</h2>
            <p className="text-xs text-slate-400 font-mono">Prefix: td_test_9f8a3c4b | Created: Today</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            ACTIVE
          </span>
        </div>

        <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-between font-mono text-xs text-slate-200">
          <span className="truncate pr-4">{rawTestKey}</span>
          <button 
            onClick={handleCopy}
            className="px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>
        </div>

        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 flex-shrink-0" />
          <span>Keep your API keys secret. Never commit API keys directly into public git repositories.</span>
        </div>
      </div>
    </div>
  );
}
