'use client';

import { useState, useEffect } from 'react';
import { FolderKanban, Bot, Plus, ArrowRight, Check } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/projects', { headers });
        if (res.ok) setProjects(await res.json());
      } catch (e) {
        console.error("Error fetching projects:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="h-6 w-6 text-blue-400" />
            Projects & Agent Management
          </h1>
          <p className="text-xs text-slate-400">Configure environments, create projects, and manage production agents.</p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">{proj.name}</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-400">{proj.description}</p>

            <div className="pt-4 border-t border-dark-800 space-y-2">
              <div className="text-xs font-mono text-slate-300 font-bold">MANAGED AGENTS:</div>
              
              <div className="p-3 rounded bg-dark-950 border border-dark-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold">Customer Support Agent</span>
                  <div className="text-[10px] text-slate-500">Current Release: v1.5</div>
                </div>
                <span className="text-amber-400 text-[10px] font-bold">REGRESSION ALERT</span>
              </div>

              <div className="p-3 rounded bg-dark-950 border border-dark-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold">Market Research Agent</span>
                  <div className="text-[10px] text-slate-500">Current Release: v1.0</div>
                </div>
                <span className="text-emerald-400 text-[10px]">STABLE</span>
              </div>

              <div className="p-3 rounded bg-dark-950 border border-dark-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold">Finance Execution Agent</span>
                  <div className="text-[10px] text-slate-500">Current Release: v1.0</div>
                </div>
                <span className="text-blue-400 text-[10px]">POLICIES ACTIVE</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
