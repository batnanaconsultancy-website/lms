'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h1 className="font-display font-bold text-2xl mb-1">Create account</h1>
          <p className="text-slate-400 text-sm mb-6">Start your coding journey</p>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="Jane Doe" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            </div>
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {['student', 'instructor'].map(role => (
                  <button type="button" key={role}
                    onClick={() => setForm(f => ({ ...f, role }))}
                    className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                      form.role === role
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}>
                    {role === 'student' ? '🎓 Student' : '👨‍🏫 Instructor'}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
