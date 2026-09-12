'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderKanban, Bot, Plus, ArrowRight, Activity, Layers, Key, Check, AlertCircle } from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Project name is required');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim(), description })
      });

      if (res.ok) {
        const newProj = await res.json();
        setShowModal(false);
        setName('');
        setDescription('');
        router.push(`/dashboard/projects/${newProj.id}`);
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to create project');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="h-5 w-5 text-blue-400" />
            Projects & Agent Fleet
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage production project workspaces, multi-environment routing, and autonomous agent fleets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-dark-900 border border-dark-800 rounded-xl space-y-3">
          <FolderKanban className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You don't have any projects in this organization yet. Create your first project workspace to register agents and collect trace telemetry.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Link href={`/dashboard/projects/${proj.id}`} className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                    {proj.name}
                  </Link>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-dark-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-500">ID: {proj.id.slice(0, 8)}...</span>
                <Link
                  href={`/dashboard/projects/${proj.id}`}
                  className="px-3 py-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 border border-dark-700 text-xs font-semibold text-blue-400 flex items-center gap-1.5 transition-colors"
                >
                  View Details & Agents
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Create New Project</h2>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Customer Support AI"
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose and target environments of this project..."
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
