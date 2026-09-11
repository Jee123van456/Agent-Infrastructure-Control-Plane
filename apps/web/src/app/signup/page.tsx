'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, Lock, Mail, User, Building, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          organization_name: orgName
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Signup failed');
      }

      const data = await res.json();
      localStorage.setItem('td_token', data.access_token);
      localStorage.setItem('td_user', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col items-center justify-center p-6 grid-bg font-sans">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-white">TYLER<span className="text-blue-500">DECK</span></span>
        </div>

        <h2 className="text-xl font-bold text-center text-white mb-2">Create Your Account</h2>
        <p className="text-xs text-center text-slate-400 mb-6">Start observing and securing production AI agents</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">FULL NAME</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Alex Mercer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">ORGANIZATION NAME</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Acme AI Technologies"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="alex@acmeai.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Organization...' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
