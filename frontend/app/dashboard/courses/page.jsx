'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { enrollmentsAPI } from '../../../lib/api';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentsAPI.mine()
      .then(r => setEnrollments(r.data.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500 animate-pulse">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">My Courses</h1>
        <Link href="/courses" className="btn-ghost text-sm border border-white/10">Browse more →</Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
          <Link href="/courses" className="btn-primary inline-block">Browse courses</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((e) => {
            const pct = e.total_lessons > 0
              ? Math.round((e.completed_lessons / e.total_lessons) * 100) : 0;
            return (
              <Link key={e.id} href={`/courses/${e.slug}`}
                className="card flex items-center gap-4 hover:border-white/15 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-brand-500/10 flex items-center justify-center text-2xl shrink-0">
                  🎓
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-brand-300 transition-colors truncate">
                    {e.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">{e.instructor_name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{pct}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {e.completed_at
                    ? <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">✓ Done</span>
                    : <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {e.completed_lessons}/{e.total_lessons}
                      </span>
                  }
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
