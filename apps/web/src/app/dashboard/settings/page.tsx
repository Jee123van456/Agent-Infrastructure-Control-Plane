'use client';

import { Settings, ShieldCheck, Database, Users } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-slate-400" />
          Organization & Control Plane Settings
        </h1>
        <p className="text-xs text-slate-400">Configure tenant parameters, retention policies, and team permissions.</p>
      </div>

      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-6 shadow-xl text-xs">
        <div>
          <h2 className="text-sm font-bold text-white mb-2">Organization Profile</h2>
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <label className="text-slate-400 block mb-1">ORGANIZATION NAME</label>
              <input type="text" value="Acme AI Technologies" readOnly className="w-full p-2 rounded bg-dark-950 border border-dark-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">TENANT SLUG</label>
              <input type="text" value="acme-ai-corp" readOnly className="w-full p-2 rounded bg-dark-950 border border-dark-800 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dark-800">
          <h2 className="text-sm font-bold text-white mb-2">Data Retention Policy</h2>
          <div className="p-4 rounded bg-dark-950 border border-dark-800 flex items-center justify-between font-mono">
            <div>
              <div className="text-white font-bold">Trace & Event Retention: 90 Days</div>
              <div className="text-slate-500 text-[11px]">Pro Tier active retention window</div>
            </div>
            <span className="text-emerald-400 font-bold">ENFORCED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
