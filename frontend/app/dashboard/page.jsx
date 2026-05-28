'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../hooks/useAuth';
import { progressAPI, enrollmentsAPI } from '../../lib/api';

function StatCard({ value, label, icon, color = 'brand' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${color}-500/10`}>
        {icon}
      </div>
      <div>
        <div className="font-display font-bold text-2xl text-white">{value}</div>
        <div className="text-slate-400 text-sm">{label}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-brand-500 rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    progressAPI.stats().then(r => setStats(r.data)).catch(() => {});
    enrollmentsAPI.mine().then(r => setEnrollments(r.data.enrollments || [])).catch(() => {});
  }, []);

  // Instructor redirect hint
  if (user?.role === 'instructor') {
    return <InstructorOverview user={user} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400">Here's where you left off.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" value={stats?.enrolledCourses ?? '—'} label="Enrolled courses" />
        <StatCard icon="✅" value={stats?.completedCourses ?? '—'} label="Completed" />
        <StatCard icon="📝" value={stats?.gradedAssignments ?? '—'} label="Graded assignments" />
        <StatCard icon="🔥" value={stats?.activeDays ?? '—'} label="Active days (30d)" />
      </div>

      {/* Active Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Continue learning</h2>
          <Link href="/dashboard/courses" className="text-brand-400 text-sm hover:text-brand-300">
            View all →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400 mb-4">You're not enrolled in any courses yet.</p>
            <Link href="/courses" className="btn-primary inline-block">Browse courses</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.slice(0, 6).map((e) => {
              const pct = e.total_lessons > 0
                ? Math.round((e.completed_lessons / e.total_lessons) * 100)
                : 0;
              return (
                <Link key={e.id} href={`/courses/${e.slug}`}
                  className="card hover:border-white/15 transition-all hover:-translate-y-0.5 group block">
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {e.level}
                    </span>
                    <span className="text-slate-500 text-xs">{pct}%</span>
                  </div>
                  <h3 className="font-display font-semibold text-base mb-1 group-hover:text-brand-300 transition-colors line-clamp-2">
                    {e.title}
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">{e.instructor_name}</p>
                  <ProgressBar value={pct} />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>{e.completed_lessons}/{e.total_lessons} lessons</span>
                    {e.completed_at && <span className="text-green-400">✓ Complete</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InstructorOverview({ user }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">
          Instructor Dashboard
        </h1>
        <p className="text-slate-400">Manage your courses and students.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/teach" className="card hover:border-white/15 transition-all group">
          <div className="text-3xl mb-3">▦</div>
          <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-brand-300 transition-colors">My Courses</h3>
          <p className="text-slate-400 text-sm">View and manage all your published and draft courses.</p>
        </Link>
        <Link href="/dashboard/teach/new" className="card hover:border-white/15 transition-all group border-dashed">
          <div className="text-3xl mb-3">✦</div>
          <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-brand-300 transition-colors">Create Course</h3>
          <p className="text-slate-400 text-sm">Build a new course with modules, lessons, and assignments.</p>
        </Link>
        <Link href="/dashboard/grades" className="card hover:border-white/15 transition-all group">
          <div className="text-3xl mb-3">◧</div>
          <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-brand-300 transition-colors">Grade Book</h3>
          <p className="text-slate-400 text-sm">Review and grade student submissions.</p>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
