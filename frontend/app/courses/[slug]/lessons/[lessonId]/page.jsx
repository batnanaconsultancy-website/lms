'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { lessonsAPI, progressAPI, coursesAPI } from '../../../../lib/api';

export default function LessonPage() {
  const { slug, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    lessonsAPI.get(lessonId).then(r => setLesson(r.data.lesson)).catch(() => {});
    coursesAPI.get(slug).then(r => setCourse(r.data.course)).catch(() => {});
    startRef.current = Date.now();
  }, [lessonId]);

  async function markComplete() {
    setMarking(true);
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    try {
      await progressAPI.complete(lessonId, seconds);
      setCompleted(true);
    } catch {}
    setMarking(false);
  }

  // Get prev/next lesson IDs from course modules
  const allLessons = course?.modules?.flatMap(m => m.lessons || []) || [];
  const idx = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  if (!lesson) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading lesson…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Top bar */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-4">
        <Link href={`/courses/${slug}`} className="text-slate-500 hover:text-white text-sm">
          ← {lesson.course_title}
        </Link>
        <span className="text-slate-700">›</span>
        <span className="text-slate-400 text-sm truncate">{lesson.title}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 capitalize">
                {lesson.type}
              </span>
              <span className="text-slate-500 text-sm">{lesson.module_title}</span>
            </div>
            <h1 className="font-display font-bold text-2xl">{lesson.title}</h1>

            {/* Video player */}
            {lesson.type === 'video' && lesson.video_url && (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Text / markdown content */}
            {lesson.content && (
              <div className="card prose prose-invert prose-sm max-w-none">
                <div
                  className="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-sm"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            )}

            {/* Complete button */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex gap-2">
                {prevLesson && (
                  <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}
                    className="btn-ghost border border-white/10 text-sm">
                    ← Previous
                  </Link>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {completed ? (
                  <span className="text-green-400 text-sm font-medium">✓ Completed</span>
                ) : (
                  <button onClick={markComplete} disabled={marking} className="btn-primary text-sm">
                    {marking ? 'Marking…' : 'Mark complete'}
                  </button>
                )}
                {nextLesson && (
                  <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}
                    className="btn-primary text-sm">
                    Next →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: lesson list */}
          <div className="hidden lg:block">
            <div className="card sticky top-6">
              <h3 className="font-display font-semibold text-sm mb-4 text-slate-300">Course content</h3>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {course?.modules?.map(mod => (
                  <div key={mod.id}>
                    <div className="text-xs text-slate-500 font-medium mb-1 px-1">{mod.title}</div>
                    {mod.lessons?.map(l => (
                      <Link key={l.id} href={`/courses/${slug}/lessons/${l.id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                          l.id === lessonId
                            ? 'bg-brand-500/15 text-brand-300'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}>
                        <span>{l.id === lessonId ? '▶' : '○'}</span>
                        <span className="truncate">{l.title}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
