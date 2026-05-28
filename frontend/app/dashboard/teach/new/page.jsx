'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { coursesAPI } from '../../../../lib/api';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['Web Development', 'Data Science', 'DevOps', 'Mobile', 'Security', 'Other'];

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', level: 'beginner',
    category: '', tags: '', price: '0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        price: parseFloat(form.price) || 0,
      };
      const { data } = await coursesAPI.create(payload);
      router.push(`/dashboard/teach`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Create New Course</h1>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 card">
        <div>
          <label className="label">Course title *</label>
          <input className="input" placeholder="Full-Stack JavaScript Bootcamp"
            value={form.title} onChange={e => update('title', e.target.value)} required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px] resize-none" placeholder="What will students learn?"
            value={form.description} onChange={e => update('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Level</label>
            <select className="input" value={form.level} onChange={e => update('level', e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l} className="bg-surface-900 capitalize">{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
              <option value="" className="bg-surface-900">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface-900">{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Tags (comma-separated)</label>
          <input className="input font-mono text-sm" placeholder="javascript, react, nodejs"
            value={form.tags} onChange={e => update('tags', e.target.value)} />
        </div>

        <div>
          <label className="label">Price (USD) — 0 for free</label>
          <input className="input" type="number" min="0" step="0.01" placeholder="0"
            value={form.price} onChange={e => update('price', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? 'Creating…' : 'Create course'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost border border-white/10 px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
