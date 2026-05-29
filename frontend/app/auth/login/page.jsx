'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="block text-center mb-8">
          <span className="font-display font-bold text-2xl">
            Code<span className="text-brand-500">Forge</span>
          </span>
        </Link>

        <div className="card">
          <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-6">Sign in to continue learning</p>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300">
              Create one
            </Link>
          </p>

          <div className="mt-4 p-3 bg-white/3 rounded-xl text-xs text-slate-500 space-y-1">
            <div>Demo: <span className="text-slate-300">student@codeforge.dev</span> / <span className="text-slate-300">Student123!</span></div>
            <div>Instructor: <span className="text-slate-300">instructor@codeforge.dev</span> / <span className="text-slate-300">Instructor1!</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
