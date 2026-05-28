'use client';
import Link from 'next/link';

const features = [
  { icon: '🎓', title: 'Structured Courses', desc: 'Video & text lessons organized in modules. Go from zero to production-ready.' },
  { icon: '⚡', title: 'Live GitHub Sync', desc: 'Push your code and see your LMS update in real time. GitHub is your source of truth.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Know exactly where every student stands. Instructors get a live grade book.' },
  { icon: '🛠️', title: 'Real Assignments', desc: 'Submit via text, file upload, or link a GitHub repo directly to your submission.' },
];

const stats = [
  { n: '500+', label: 'Lessons' },
  { n: '12k+', label: 'Students' },
  { n: '98%',  label: 'Completion' },
  { n: '24/7', label: 'Access' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-950 text-white overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 glass">
        <span className="font-display font-bold text-xl tracking-tight">
          Code<span className="text-brand-500">Forge</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">Log in</Link>
          <Link href="/auth/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 text-center">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,110,247,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(79,110,247,0.07)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        {/* Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 mb-6">
            🚀 Now with live GitHub sync
          </span>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] mb-6">
            Learn to build<br />
            <span className="text-brand-400">real software.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            A coding bootcamp platform where every lesson pushes you closer
            to production-ready skills. Your GitHub is the classroom.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth/register" className="btn-primary text-base px-8 py-3">
              Start learning free
            </Link>
            <Link href="/courses" className="btn-ghost border border-white/10 text-base px-8 py-3">
              Browse courses →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ n, label }) => (
          <div key={label} className="card text-center">
            <div className="font-display font-bold text-3xl text-brand-400">{n}</div>
            <div className="text-slate-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <h2 className="font-display font-bold text-3xl text-center mb-12">
          Built for real developers
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card hover:border-white/15 transition-colors">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="card border-brand-500/20 bg-brand-500/5">
          <h2 className="font-display font-bold text-3xl mb-3">Ready to ship your first project?</h2>
          <p className="text-slate-400 mb-6">Join thousands of students who went from tutorials to production.</p>
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3 inline-block">
            Create free account
          </Link>
        </div>
      </section>

      <footer className="text-center text-slate-600 text-sm pb-8">
        © 2024 CodeForge LMS. Built with Next.js + Neon PostgreSQL.
      </footer>
    </main>
  );
}
