'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const token = localStorage.getItem('td_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch('/api/v1/alerts/events', { headers });
        if (res.ok) setEvents(await res.json());
      } catch (e) {
        console.error("Error fetching alerts:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Bell className="h-6 w-6 text-amber-400" />
          Active Agent Alert Center
        </h1>
        <p className="text-xs text-slate-400">Automated triggers when success rate drops, latency spikes, or security policies are violated.</p>
      </div>

      <div className="p-6 rounded-xl bg-dark-900 border border-dark-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white">Recent Triggered Alerts</h2>

        <div className="space-y-3 font-mono text-xs">
          {events.map((ev, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-dark-950 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{ev.alert_name} ({ev.agent_name})</span>
                  <span className="text-amber-400 font-bold">{ev.severity}</span>
                </div>
                <p className="text-slate-300">{ev.message}</p>
                <div className="text-[10px] text-slate-500 mt-2">Triggered: {new Date(ev.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
