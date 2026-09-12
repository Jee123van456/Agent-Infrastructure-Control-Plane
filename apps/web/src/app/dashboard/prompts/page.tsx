'use client';

import { useState, useEffect } from 'react';
import { FolderKanban, Plus, GitBranch, Check, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptDesc, setNewPromptDesc] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/prompts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
        if (data.length > 0) setSelectedPrompt(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPromptName,
          description: newPromptDesc,
          initial_content: newPromptContent,
          variables: ['customer_name', 'order_id']
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewPromptName('');
        setNewPromptDesc('');
        setNewPromptContent('');
        fetchPrompts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-blue-400" />
            Prompt Management & Version Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Version, label, compare, and link system prompts directly to LLM trace generations.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Prompt
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompts List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Managed Prompts ({prompts.length})
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              Loading prompts...
            </div>
          ) : prompts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              No prompts configured yet. Click "Create Prompt" to add one.
            </div>
          ) : (
            prompts.map((p) => {
              const isSelected = selectedPrompt?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrompt(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/40 text-white'
                      : 'bg-dark-900 border-dark-800 hover:border-dark-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.current_version?.version || 'v1.0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="text-blue-400">Environment: {p.current_version?.environment_label || 'production'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Prompt Version Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPrompt ? (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-dark-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedPrompt.name}</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {selectedPrompt.current_version?.version || 'v1.0'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedPrompt.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                    PRODUCTION
                  </span>
                </div>
              </div>

              {/* Version Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Prompt System Content
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Created by {selectedPrompt.current_version?.created_by || 'alex@acmeai.com'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedPrompt.current_version?.content || 'No content available.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
              Select a prompt to view version history and deployment status.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Create New Prompt</h2>
            <form onSubmit={handleCreatePrompt} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Prompt Name</label>
                <input
                  type="text"
                  required
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="e.g. Support-Agent-System-Prompt"
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newPromptDesc}
                  onChange={(e) => setNewPromptDesc(e.target.value)}
                  placeholder="Purpose of this system prompt"
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Prompt Content</label>
                <textarea
                  required
                  rows={5}
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                  placeholder="You are a helpful AI assistant..."
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
