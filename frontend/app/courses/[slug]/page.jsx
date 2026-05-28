'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { coursesAPI, enrollmentsAPI, progressAPI } from '../../../lib/api';
import { useAuthStore } from '../../../hooks/useAuth';

function LessonRow({ lesson, completed, courseSlug }) {
  const typeIcon = { video: '▶', text: '◉', quiz: '◈', assignment: '◧' }[lesson.type] || '◉';
  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 group ${
        lesson.is_free_preview ? '' : 'opacity-70'
      }`}
    >
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
        completed ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-slate-400'
      }`}>
        {completed ? '✓' : typeIcon}
      </span>
      <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
        {lesson.title}
      </span>
      <span className="text-xs text-slate-500 shrink-0">
        {lesson.duration_minutes ? `${lesson.duration_minutes}m` : ''}
        {lesson.is_free_preview && !completed && (
          <span className="ml-2 badge bg-brand-500/10 text-brand-400 text-[10px]">Free</span>
        )}
      </span>
    </Link>
  );
}

export default function CoursePage() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState({ completedLessons: 0, totalLessons: 0, progress: [] });
  const [enrolling, setEnrolling] = useState(false);
  const [openModule, setOpenModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.get(slug)
      .then(r => {
        setCourse(r.data.course);
        setOpenModule(r.data.course.modules?.[0]?.id || null);
      })
      .catch(() => router.push('/courses'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!course || !user) return;
    enrollmentsAPI.check(course.id).then(r => setEnrolled(r.data.enrolled)).catch(() => {});
    progressAPI.course(course.id).then(r => setProgress(r.data)).catch(() => {});
  }, [course, user]);

  async function handleEnroll() {
    if (!user) return router.push('/auth/login');
    setEnrolling(true);
    try {
      await enrollmentsAPI.enroll(course.id);
      setEnrolled(true);
    } catch (e) {
      alert(e.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/2" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </div>
      </div>
    );
  }
  if (!course) return null;

  const completedIds = new Set(
    (progress.progress || []).filter(p => p.completed).map(p => p.lesson_id)
  );
  const pct = progress.totalLessons > 0
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;
  const totalDuration = (course.modules || [])
    .flatMap(m => m.lessons || [])
    .reduce((s, l) => s + (l.duration_minutes || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <Link href="/courses" className="text-slate-500 text-sm hover:text-white mb-6 block">← Back to courses</Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Course info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 flex-wrap">
            <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">{course.level}</span>
            {course.category && <span className="badge bg-white/5 text-slate-400">{course.category}</span>}
          </div>
          <h1 className="font-display font-bold text-3xl leading-snug">{course.title}</h1>
          <p className="text-slate-400 leading-relaxed">{course.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <span>👨‍🏫 {course.instructor_name}</span>
            <span>👥 {parseInt(course.enrolled_count || 0).toLocaleString()} students</span>
            <span>⏱ {Math.round(totalDuration / 60)}h {totalDuration % 60}m total</span>
          </div>

          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {course.tags.map(t => (
                <span key={t} className="badge bg-white/5 text-slate-400 border border-white/8 font-mono text-xs">{t}</span>
              ))}
            </div>
          )}

          {/* Progress bar (enrolled) */}
          {enrolled && (
            <div className="card">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">Your progress</span>
                <span className="text-brand-400">{pct}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-slate-500 text-xs mt-2">{progress.completedLessons} / {progress.totalLessons} lessons completed</p>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Curriculum</h2>
            <div className="space-y-3">
              {(course.modules || []).map(mod => (
                <div key={mod.id} className="card">
                  <button
                    onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-sm">{mod.title}</span>
                    <span className="text-slate-500 text-xs">
                      {mod.lessons?.length || 0} lessons
                      <span className="ml-2">{openModule === mod.id ? '▲' : '▼'}</span>
                    </span>
                  </button>
                  {openModule === mod.id && (
                    <div className="mt-3 space-y-0.5 border-t border-white/5 pt-3">
                      {(mod.lessons || []).map(l => (
                        <LessonRow
                          key={l.id}
                          lesson={l}
                          completed={completedIds.has(l.id)}
                          courseSlug={slug}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Enroll card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="aspect-video bg-gradient-to-br from-brand-500/20 to-surface-800 rounded-xl mb-4 flex items-center justify-center text-5xl">
              {course.thumbnail_url
                ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover rounded-xl" />
                : '🎓'}
            </div>
            <div className="text-2xl font-display font-bold mb-1">
              {parseFloat(course.price) === 0 ? 'Free' : `$${course.price}`}
            </div>

            {enrolled ? (
              <div className="space-y-3">
                <div className="text-center text-green-400 text-sm font-medium py-2">✓ Enrolled</div>
                <Link
                  href={`/courses/${slug}/lessons/${course.modules?.[0]?.lessons?.[0]?.id}`}
                  className="btn-primary w-full py-3 text-center block"
                >
                  Continue learning
                </Link>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                {enrolling ? 'Enrolling…' : 'Enroll now — Free'}
              </button>
            )}

            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>✓ {progress.totalLessons || '—'} lessons</li>
              <li>✓ Lifetime access</li>
              <li>✓ Certificate on completion</li>
              <li>✓ GitHub sync included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
