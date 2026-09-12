'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck, CheckCircle2, 
  Sparkles, Key, Check, RefreshCw, X 
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@acmeai.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'magic_link'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Modals for Google & Apple OAuth
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customAppleEmail, setCustomAppleEmail] = useState('');

  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('td_token', data.access_token);
      localStorage.setItem('td_user', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple', targetEmail: string, name?: string) => {
    setLoading(true);
    setError('');
    setShowGoogleModal(false);
    setShowAppleModal(false);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: targetEmail,
          full_name: name || targetEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          provider_user_id: `oauth_${provider}_${Date.now()}`,
          avatar_url: provider === 'google' 
            ? 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
            : undefined
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `${provider.toUpperCase()} Authentication failed`);
      }

      const data = await res.json();
      localStorage.setItem('td_token', data.access_token);
      localStorage.setItem('td_user', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || `${provider} OAuth sign-in error.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setMagicLinkSent(true);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-dark-900/90 border border-dark-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-6 z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">TYLER<span className="text-blue-500">DECK</span></span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Sign in to Control Plane</h1>
          <p className="text-xs text-slate-400">Autonomous AI Agent Reliability & Observability SaaS</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Social SSO Logins (Google & Apple) */}
        <div className="space-y-3">
          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 transition-all hover:border-slate-600 shadow-sm"
          >
            {/* Multi-color Google G Icon SVG */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          {/* Apple ID Sign-In */}
          <button
            type="button"
            onClick={() => setShowAppleModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 transition-all hover:border-slate-600 shadow-sm"
          >
            {/* Apple Icon SVG */}
            <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.67-3.03-7.6-7.85-11.78-14.46-7.89-12.51-13.62-26.65-17.18-42.42-3.56-15.77-5.34-30.82-5.34-45.14 0-16.73 3.99-31.02 11.96-42.87 7.97-11.85 18.25-17.9 30.84-18.15 4.58 0 9.77 1.2 15.57 3.6 5.8 2.4 9.9 3.6 12.3 3.6 2.13 0 6.35-1.26 12.65-3.79 6.3-2.53 11.62-3.7 15.96-3.5 11.72.63 21.28 4.7 28.67 12.21-10.4 6.28-15.42 15.3-15.06 27.06.36 10.96 4.78 19.8 13.26 26.52 4.41 3.52 9.39 6.03 14.94 7.53-2.88 8.64-6.85 17.07-11.91 25.3zM119.22 30.14c0-7.23 2.65-14.31 7.95-21.24 5.3-6.93 12.06-11.56 20.27-13.9 1.13 8.35-1.25 16.03-7.14 23.04-5.89 7.01-12.92 11.14-21.08 12.39-.12-.1-.18-.17-.18-.29z" />
            </svg>
            <span>Continue with Apple ID</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-dark-800 w-full" />
          <span className="bg-dark-900 px-3 text-[10px] uppercase font-mono text-slate-500 tracking-wider">Or email login</span>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1 bg-dark-950 rounded-xl border border-dark-800 text-xs font-mono">
          <button
            onClick={() => { setActiveTab('password'); setMagicLinkSent(false); }}
            className={`py-1.5 rounded-lg transition-all font-bold ${activeTab === 'password' ? 'bg-dark-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Password Sign In
          </button>
          <button
            onClick={() => setActiveTab('magic_link')}
            className={`py-1.5 rounded-lg transition-all font-bold ${activeTab === 'magic_link' ? 'bg-dark-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Magic Link
          </button>
        </div>

        {/* Tab 1: Password Form */}
        {activeTab === 'password' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono text-slate-300 mb-1">WORK EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex@acmeai.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-slate-300">SECURITY PASSWORD</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); setActiveTab('magic_link'); }} className="text-blue-400 hover:underline text-[11px]">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Sign In to Workspace'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {/* Tab 2: Magic Link Form */}
        {activeTab === 'magic_link' && (
          <div className="space-y-4 text-xs">
            {magicLinkSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Magic Link Sent!</h3>
                <p className="text-[11px] text-slate-300">
                  We've sent a secure login link to <strong>{email}</strong>. Check your inbox to sign in instantly.
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-xs text-blue-400 hover:underline pt-2 inline-block font-mono"
                >
                  Resend magic link
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div>
                  <label className="block font-mono text-slate-300 mb-1">REGISTERED EMAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="alex@acmeai.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Send Magic Login Link
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Security Badges */}
        <div className="pt-4 border-t border-dark-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 256-bit AES Auth
          </span>
          <Link href="/signup" className="text-blue-400 font-bold hover:underline">
            Create Account →
          </Link>
        </div>
      </div>

      {/* Google OAuth Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowGoogleModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mx-auto shadow-md">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Sign in with Google</h3>
              <p className="text-xs text-slate-400">Choose an account to continue to <strong>TylerDeck</strong></p>
            </div>

            {/* Simulated Accounts List */}
            <div className="space-y-2 pt-2 text-xs">
              <button
                onClick={() => handleOAuthLogin('google', 'alex.mercer@gmail.com', 'Alex Mercer')}
                className="w-full p-3 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-800 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-bold text-white">Alex Mercer</div>
                  <div className="text-[11px] text-slate-400 font-mono">alex.mercer@gmail.com</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">Connected</span>
              </button>

              <button
                onClick={() => handleOAuthLogin('google', 'dev.team@acmeai.com', 'Acme Engineering')}
                className="w-full p-3 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-800 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-bold text-white">Acme Engineering</div>
                  <div className="text-[11px] text-slate-400 font-mono">dev.team@acmeai.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google Account Input */}
            <div className="pt-2 space-y-2 border-t border-dark-800 text-xs">
              <label className="block text-slate-400 font-mono text-[11px]">Use another Google email:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                />
                <button
                  disabled={!customGoogleEmail.includes('@')}
                  onClick={() => handleOAuthLogin('google', customGoogleEmail)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apple ID OAuth Modal */}
      {showAppleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowAppleModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mx-auto shadow-md">
                <svg className="h-6 w-6 fill-current text-black" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.67-3.03-7.6-7.85-11.78-14.46-7.89-12.51-13.62-26.65-17.18-42.42-3.56-15.77-5.34-30.82-5.34-45.14 0-16.73 3.99-31.02 11.96-42.87 7.97-11.85 18.25-17.9 30.84-18.15 4.58 0 9.77 1.2 15.57 3.6 5.8 2.4 9.9 3.6 12.3 3.6 2.13 0 6.35-1.26 12.65-3.79 6.3-2.53 11.62-3.7 15.96-3.5 11.72.63 21.28 4.7 28.67 12.21-10.4 6.28-15.42 15.3-15.06 27.06.36 10.96 4.78 19.8 13.26 26.52 4.41 3.52 9.39 6.03 14.94 7.53-2.88 8.64-6.85 17.07-11.91 25.3zM119.22 30.14c0-7.23 2.65-14.31 7.95-21.24 5.3-6.93 12.06-11.56 20.27-13.9 1.13 8.35-1.25 16.03-7.14 23.04-5.89 7.01-12.92 11.14-21.08 12.39-.12-.1-.18-.17-.18-.29z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Sign in with Apple ID</h3>
              <p className="text-xs text-slate-400">Use your Apple ID to sign in to <strong>TylerDeck</strong></p>
            </div>

            {/* Apple ID Options */}
            <div className="space-y-2 pt-2 text-xs">
              <button
                onClick={() => handleOAuthLogin('apple', 'alex.mercer@icloud.com', 'Alex Mercer')}
                className="w-full p-3 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-800 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-bold text-white">Share My Email</div>
                  <div className="text-[11px] text-slate-400 font-mono">alex.mercer@icloud.com</div>
                </div>
                <Check className="h-4 w-4 text-emerald-400" />
              </button>

              <button
                onClick={() => handleOAuthLogin('apple', 'privatized_user_99@privaterelay.appleid.com', 'Apple User')}
                className="w-full p-3 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-800 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-bold text-white">Hide My Email</div>
                  <div className="text-[11px] text-slate-400 font-mono">privatized_user_99@privaterelay.appleid.com</div>
                </div>
              </button>
            </div>

            {/* Custom Apple Email */}
            <div className="pt-2 space-y-2 border-t border-dark-800 text-xs">
              <label className="block text-slate-400 font-mono text-[11px]">Or enter your Apple ID email:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@icloud.com"
                  value={customAppleEmail}
                  onChange={(e) => setCustomAppleEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-dark-950 border border-dark-800 text-white font-mono"
                />
                <button
                  disabled={!customAppleEmail.includes('@')}
                  onClick={() => handleOAuthLogin('apple', customAppleEmail)}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-slate-200 font-bold disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
