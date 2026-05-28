'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../hooks/useAuth';

const studentNav = [
  { href: '/dashboard',              icon: '⬡', label: 'Overview' },
  { href: '/dashboard/courses',      icon: '▦', label: 'My Courses' },
  { href: '/courses',                icon: '◈', label: 'Browse' },
  { href: '/dashboard/assignments',  icon: '◧', label: 'Assignments' },
  { href: '/dashboard/progress',     icon: '◉', label: 'Progress' },
];

const instructorNav = [
  { href: '/dashboard',              icon: '⬡', label: 'Overview' },
  { href: '/dashboard/teach',        icon: '▦', label: 'My Courses' },
  { href: '/dashboard/teach/new',    icon: '✦', label: 'New Course' },
  { href: '/dashboard/grades',       icon: '◧', label: 'Grade Book' },
];

const adminNav = [
  { href: '/dashboard',              icon: '⬡', label: 'Overview' },
  { href: '/dashboard/admin/users',  icon: '◈', label: 'Users' },
  { href: '/dashboard/admin/courses',icon: '▦', label: 'Courses' },
];

export default function DashboardLayout({ children }) {
  const { user, loading, init, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-slate-500 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  const nav = user.role === 'admin' ? adminNav
    : user.role === 'instructor' ? instructorNav
    : studentNav;

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/5 flex flex-col py-6 px-3 sticky top-0 h-screen">
        <Link href="/" className="px-3 mb-8 block">
          <span className="font-display font-bold text-lg">
            Code<span className="text-brand-500">Forge</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5">
          {nav.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-brand-500/15 text-brand-300 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 pt-4 mt-4 px-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 text-sm font-bold">
              {user.fullName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.fullName || 'User'}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors px-1 py-1">
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
