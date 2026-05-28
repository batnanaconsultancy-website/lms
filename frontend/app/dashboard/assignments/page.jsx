'use client';
import { useEffect, useState } from 'react';
import { submissionsAPI, enrollmentsAPI, assignmentsAPI } from '../../../lib/api';

const statusBadge = {
  draft:     'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  submitted: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  graded:    'bg-green-500/10 text-green-400 border border-green-500/20',
  returned:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

export default function AssignmentsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsAPI.mine()
      .then(r => setSubmissions(r.data.submissions || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500 animate-pulse">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Assignments</h1>

      {submissions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-400">No assignments submitted yet.</p>
          <p className="text-slate-500 text-sm mt-2">Enroll in courses and complete assignments to see them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">{s.course_title}</div>
                  <h3 className="font-medium text-sm">{s.assignment_title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`badge text-xs ${statusBadge[s.status] || statusBadge.submitted}`}>
                      {s.status}
                    </span>
                    {s.score !== null && (
                      <span className="text-sm font-mono">
                        <span className="text-brand-400">{s.score}</span>
                        <span className="text-slate-600">/{s.max_score}</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      Submitted {new Date(s.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  {s.feedback && (
                    <div className="mt-3 text-xs text-slate-400 bg-white/3 rounded-lg p-3 border border-white/5">
                      <div className="text-slate-500 mb-1 font-medium">Instructor feedback:</div>
                      {s.feedback}
                    </div>
                  )}
                </div>
                {s.github_repo_url && (
                  <a href={s.github_repo_url} target="_blank" rel="noopener noreferrer"
                    className="badge bg-white/5 text-slate-400 border border-white/10 shrink-0 hover:text-white transition-colors">
                    ⎋ GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
