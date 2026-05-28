'use client';
import { useEffect, useState } from 'react';
import { coursesAPI, submissionsAPI } from '../../../lib/api';

export default function GradesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    coursesAPI.mine().then(r => {
      const cs = r.data.courses || [];
      setCourses(cs);
      if (cs[0]) setSelectedCourse(cs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    submissionsAPI.byCourse(selectedCourse)
      .then(r => setSubmissions(r.data.submissions || []))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  async function submitGrade(submissionId) {
    await submissionsAPI.grade(submissionId, {
      score: parseInt(gradeForm.score),
      feedback: gradeForm.feedback,
    });
    setSubmissions(ss => ss.map(s =>
      s.id === submissionId
        ? { ...s, score: parseInt(gradeForm.score), feedback: gradeForm.feedback, status: 'graded' }
        : s
    ));
    setGrading(null);
    setGradeForm({ score: '', feedback: '' });
  }

  const pending = submissions.filter(s => s.status === 'submitted');
  const graded = submissions.filter(s => s.status === 'graded');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Grade Book</h1>
        <select className="input max-w-xs"
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.title}</option>)}
        </select>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">
            Needs grading ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(s => (
              <div key={s.id} className="card border-yellow-500/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">{s.assignment_title}</div>
                    <div className="font-medium text-sm">{s.student_name}</div>
                    <div className="text-slate-500 text-xs">{s.student_email}</div>
                    {s.content && (
                      <div className="mt-2 text-xs text-slate-400 bg-white/3 rounded-lg p-3 border border-white/5 max-w-md">
                        {s.content.slice(0, 200)}{s.content.length > 200 ? '…' : ''}
                      </div>
                    )}
                    {s.github_repo_url && (
                      <a href={s.github_repo_url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                        ⎋ View GitHub repo
                      </a>
                    )}
                  </div>
                  <button onClick={() => setGrading(s.id)}
                    className="btn-primary text-xs shrink-0">Grade</button>
                </div>

                {grading === s.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Score / {s.max_score}</label>
                        <input type="number" className="input" min="0" max={s.max_score}
                          value={gradeForm.score}
                          onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Feedback</label>
                      <textarea className="input resize-none min-h-[80px]"
                        placeholder="Write feedback for the student…"
                        value={gradeForm.feedback}
                        onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => submitGrade(s.id)} className="btn-primary text-sm">
                        Submit grade
                      </button>
                      <button onClick={() => setGrading(null)} className="btn-ghost text-sm border border-white/10">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graded */}
      {graded.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">Graded ({graded.length})</h2>
          <div className="space-y-2">
            {graded.map(s => (
              <div key={s.id} className="card flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-500">{s.assignment_title}</div>
                  <div className="text-sm font-medium">{s.student_name}</div>
                </div>
                <span className="font-mono text-sm">
                  <span className="text-brand-400">{s.score}</span>
                  <span className="text-slate-600">/{s.max_score}</span>
                </span>
                <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-xs">Graded</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-400">No submissions yet for this course.</p>
        </div>
      )}
    </div>
  );
}
