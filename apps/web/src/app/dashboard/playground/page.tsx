'use client';

import { useState } from 'react';
import { Cpu, Play, Clock, DollarSign, Layers, Sparkles } from 'lucide-react';

export default function PlaygroundPage() {
  const [promptContent, setPromptContent] = useState('You are an order support assistant. Resolve query: {customer_query}');
  const [inputQuery, setInputQuery] = useState('Where is my package for order #ORD-9912?');
  const [model, setModel] = useState('gpt-4o');
  const [provider, setProvider] = useState('openai');
  const [temperature, setTemperature] = useState(0.7);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);

  const handleRunPlayground = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('td_token');
      const res = await fetch('http://localhost:8000/api/v1/playground/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt_content: promptContent,
          input_variables: { customer_query: inputQuery },
          model: model,
          provider: provider,
          temperature: temperature
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-400" />
            Prompt & Model Playground
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test prompt templates and evaluate live LLM responses, latency, and cost metrics before deploying to production agents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Configuration Panel */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Configuration
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google Gemini</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
              >
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">System Prompt Template</label>
            <textarea
              rows={5}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              className="w-full p-3 rounded-lg bg-dark-950 border border-dark-800 text-xs font-mono text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Variable Input: customer_query</label>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-xs font-mono text-white"
            />
          </div>

          <button
            onClick={handleRunPlayground}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Running Request...</span>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Run Playground Request
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Execution Output & Telemetry
          </h2>

          {response ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400">Latency</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{response.latency_ms} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400 font-mono">Tokens</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{response.input_tokens + response.output_tokens}</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400">Estimated Cost</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">${response.cost_usd}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Model Response Text</div>
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {response.response_text}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-dark-950 border border-dark-800 rounded-xl">
              Configure template variables and click "Run Playground Request" to execute.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
