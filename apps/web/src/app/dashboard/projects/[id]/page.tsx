'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FolderKanban, Bot, Key, Plus, Copy, Check, AlertCircle, Layers, Activity, Clock, ShieldCheck 
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [envName, setEnvName] = useState('staging');
  const [submittingEnv, setSubmittingEnv] = useState(false);

  // Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentDesc, setAgentDesc] = useState('');
  const [agentEnv, setAgentEnv] = useState('development');
  const [agentFramework, setAgentFramework] = useState('custom');
  const [agentProvider, setAgentProvider] = useState('openai');
  const [agentModel, setAgentModel] = useState('gpt-4o');
  const [submittingAgent, setSubmittingAgent] = useState(false);

  // Key Form State
  const [keyName, setKeyName] = useState('');
  const [keyEnv, setKeyEnv] = useState('development');
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submittingKey, setSubmittingKey] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateEnvironment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!envName.trim()) {
      setErrorMsg('Environment name is required');
      return;
    }

    setSubmittingEnv(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/environments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: envName.trim() })
      });

      if (res.ok) {
        setShowEnvModal(false);
        fetchProjectDetail();
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to create environment');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Server connection error');
    } finally {
      setSubmittingEnv(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [projectId]);

  const fetchProjectDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch(`http://localhost:8000/api/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        router.push('/dashboard/projects');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!agentName.trim()) {
      setErrorMsg('Agent name is required');
      return;
    }

    setSubmittingAgent(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: agentName.trim(),
          description: agentDesc,
          environment: agentEnv,
          framework: agentFramework,
          provider: agentProvider,
          model: agentModel,
          initial_version: 'v1.0.0'
        })
      });

      if (res.ok) {
        setShowAgentModal(false);
        setAgentName('');
        setAgentDesc('');
        fetchProjectDetail();
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to create agent');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Server connection error');
    } finally {
      setSubmittingAgent(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!keyName.trim()) {
      setErrorMsg('API Key name is required');
      return;
    }

    setSubmittingKey(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: keyName.trim(), environment: keyEnv })
      });

      if (res.ok) {
        const keyData = await res.json();
        setCreatedRawKey(keyData.raw_key);
        setKeyName('');
        fetchProjectDetail();
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to generate API Key');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Server connection error');
    } finally {
      setSubmittingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (createdRawKey) {
      navigator.clipboard.writeText(createdRawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-dark-900 border border-dark-800 rounded-xl">
        Loading project workspace details...
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{project.name}</h1>
                <span className="text-[11px] font-mono text-slate-400">Project ID: {project.id}</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-3 max-w-2xl">{project.description || 'No description'}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowEnvModal(true)}
              className="px-3.5 py-2 rounded-lg bg-dark-950 hover:bg-dark-850 border border-dark-700 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Layers className="h-4 w-4 text-emerald-400" /> + New Environment
            </button>
            <button
              onClick={() => setShowAgentModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Bot className="h-4 w-4" /> + New Agent
            </button>
            <button
              onClick={() => { setCreatedRawKey(null); setShowKeyModal(true); }}
              className="px-3.5 py-2 rounded-lg bg-dark-950 hover:bg-dark-850 border border-dark-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Key className="h-4 w-4 text-amber-400" /> + Generate API Key
            </button>
            {project.agents.length > 0 && (
              <button
                onClick={() => router.push(`/connect-agent?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}&environment=${project.agents[0].environment || 'development'}&agentName=${encodeURIComponent(project.agents[0].name)}&version=${project.agents[0].current_version || 'v1.0.0'}`)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Activity className="h-4 w-4" /> Connect Agent
              </button>
            )}
          </div>
        </div>

        {/* Environments Bar */}
        <div className="pt-4 border-t border-dark-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono flex-wrap">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Environments:</span>
            {project.environments.map((e: any) => (
              <span key={e.id} className="px-2.5 py-1 rounded bg-dark-950 border border-dark-700 text-emerald-400 text-[11px] font-bold">
                {e.name}
              </span>
            ))}
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Total Traces Recorded: <strong className="text-white">{project.trace_count}</strong></span>
        </div>
      </div>

      {/* Agents Fleet Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" />
            Registered Agents ({project.agents.length})
          </h2>
        </div>

        {project.agents.length === 0 ? (
          <div className="p-8 text-center bg-dark-900 border border-dark-800 rounded-xl space-y-3">
            <Bot className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Create your first AI agent</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No agents registered in this project yet. Register an agent to configure providers, environments, and SDK connection settings.
            </p>
            <button
              onClick={() => setShowAgentModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <Bot className="h-4 w-4" /> Create Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.agents.map((agent: any) => (
              <div key={agent.id} className="bg-dark-900 border border-dark-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{agent.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      {agent.current_version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{agent.description || 'No description'}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-800/60 text-[11px] font-mono text-slate-400">
                    <div>Provider: <span className="text-slate-200">{agent.provider}</span></div>
                    <div>Model: <span className="text-slate-200">{agent.model}</span></div>
                    <div>Env: <span className="text-emerald-400 font-bold">{agent.environment}</span></div>
                    <div>Framework: <span className="text-slate-200">{agent.framework}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-dark-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">ID: {agent.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => router.push(`/connect-agent?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}&environment=${agent.environment || 'development'}&agentName=${encodeURIComponent(agent.name)}&version=${agent.current_version || 'v1.0.0'}`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Connect Agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Create New Agent</h2>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Agent Name *</label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Customer Support Agent"
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <input
                  type="text"
                  value={agentDesc}
                  onChange={(e) => setAgentDesc(e.target.value)}
                  placeholder="Role and capability description..."
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Target Environment</label>
                  <select
                    value={agentEnv}
                    onChange={(e) => setAgentEnv(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                  >
                    <option value="development">development</option>
                    <option value="staging">staging</option>
                    <option value="production">production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">LLM Provider</label>
                  <select
                    value={agentProvider}
                    onChange={(e) => setAgentProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google Gemini</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Model</label>
                  <input
                    type="text"
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                    placeholder="gpt-4o"
                    className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Framework</label>
                  <input
                    type="text"
                    value={agentFramework}
                    onChange={(e) => setAgentFramework(e.target.value)}
                    placeholder="LangChain / AutoGen / Custom"
                    className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAgentModal(false)}
                  className="px-4 py-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAgent}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  {submittingAgent ? 'Creating...' : 'Create Agent & Release v1.0.0'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Generate Project API Key</h2>
            
            {createdRawKey ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  ⚠️ <strong>IMPORTANT:</strong> Copy your secret API key now. It will <u>NEVER</u> be displayed again.
                </div>
                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-between font-mono text-xs text-white">
                  <span className="truncate pr-2">{createdRawKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 rounded-lg bg-dark-800 text-white font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Key Description Name *</label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Production Python SDK Key"
                    className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Target Environment</label>
                  <select
                    value={keyEnv}
                    onChange={(e) => setKeyEnv(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                  >
                    <option value="development">development (td_test_...)</option>
                    <option value="staging">staging (td_test_...)</option>
                    <option value="production">production (td_live_...)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingKey}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                  >
                    {submittingKey ? 'Generating...' : 'Generate Secret Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Environment Modal */}
      {showEnvModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Add Target Environment</h2>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleCreateEnvironment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Environment Name *</label>
                <input
                  type="text"
                  required
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  placeholder="e.g. development, staging, production"
                  className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnvModal(false)}
                  className="px-4 py-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEnv}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  {submittingEnv ? 'Creating...' : 'Create Environment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
