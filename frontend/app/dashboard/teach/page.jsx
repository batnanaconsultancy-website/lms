'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI } from '../../../lib/api';

export default function TeachPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.mine()
      .then(r => setCourses(r.data.courses || []))
      .finally(() => setLoading(false));
  }, []);

  async function togglePublish(course) {
    await coursesAPI.update(course.id, { is_published: !course.is_published });
    setCourses(cs => cs.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
  }

  if (loading) return <div className="text-slate-500 animate-pulse">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">My Courses</h1>
        <Link href="/dashboard/teach/new" className="btn-primary text-sm">+ New course</Link>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">✦</div>
          <p className="text-slate-400 mb-4">You haven't created any courses yet.</p>
          <Link href="/dashboard/teach/new" className="btn-primary inline-block">Create first course</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(c => (
            <div key={c.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge text-xs ${
                    c.is_published
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="badge bg-white/5 text-slate-400 capitalize text-xs">{c.level}</span>
                </div>
                <h3 className="font-medium text-sm truncate">{c.title}</h3>
                <p className="text-slate-500 text-xs mt-1">
                  {parseInt(c.enrolled_count || 0)} students enrolled
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/courses/${c.slug}`}
                  className="btn-ghost text-xs border border-white/10">View</Link>
                <button onClick={() => togglePublish(c)}
                  className="btn-ghost text-xs border border-white/10">
                  {c.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
