'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { coursesAPI } from '../../lib/api';

const LEVELS = ['', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['', 'Web Development', 'Data Science', 'DevOps', 'Mobile', 'Security'];

function CourseCard({ course }) {
  const enrolled = parseInt(course.enrolled_count) || 0;
  return (
    <Link href={`/courses/${course.slug}`}
      className="card hover:border-white/15 transition-all hover:-translate-y-0.5 group flex flex-col">
      <div className="aspect-video bg-gradient-to-br from-brand-500/20 to-surface-800 rounded-xl mb-4 flex items-center justify-center text-4xl overflow-hidden">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-xl" />
          : '🎓'}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`badge text-xs ${levelColor(course.level)}`}>{course.level}</span>
        {course.category && <span className="badge bg-white/5 text-slate-400 border border-white/8">{course.category}</span>}
      </div>
      <h3 className="font-display font-semibold text-base mb-1 group-hover:text-brand-300 transition-colors line-clamp-2 flex-1">
        {course.title}
      </h3>
      <p className="text-slate-400 text-sm line-clamp-2 mb-3">{course.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-3">
        <span>by {course.instructor_name}</span>
        <span>{enrolled.toLocaleString()} students</span>
      </div>
    </Link>
  );
}

function levelColor(level) {
  if (level === 'beginner')     return 'bg-green-500/10 text-green-400 border border-green-500/20';
  if (level === 'intermediate') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  if (level === 'advanced')     return 'bg-red-500/10 text-red-400 border border-red-500/20';
  return 'bg-white/5 text-slate-400';
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    coursesAPI.list({ search: search || undefined, level: level || undefined, category: category || undefined })
      .then(r => setCourses(r.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, level, category]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-slate-500 text-sm hover:text-white mb-4 block">← Home</Link>
        <h1 className="font-display font-bold text-4xl mb-2">Course Catalog</h1>
        <p className="text-slate-400">Browse {courses.length} courses across all disciplines</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search courses…"
          className="input max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input max-w-[160px]" value={level} onChange={e => setLevel(e.target.value)}>
          {LEVELS.map(l => <option key={l} value={l}>{l || 'All levels'}</option>)}
        </select>
        <select className="input max-w-[200px]" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All categories'}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-white/5 rounded-xl mb-4" />
              <div className="h-4 bg-white/5 rounded mb-2 w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-400">No courses found matching your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}
