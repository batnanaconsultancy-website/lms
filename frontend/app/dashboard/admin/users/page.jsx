'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '../../../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    adminAPI.stats().then(r => setStats(r.data)).finally(() => setLoadingStats(false));
    adminAPI.users().then(r => setUsers(r.data.users || []));
  }, []);

  async function toggleUser(id) {
    const { data } = await adminAPI.toggleUser(id);
    setUsers(us => us.map(u => u.id === id ? { ...u, is_active: data.user.is_active } : u));
  }

  const studentCount   = stats?.users?.find(u => u.role === 'student')?.count || 0;
  const instructorCount = stats?.users?.find(u => u.role === 'instructor')?.count || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🎓', label: 'Students',   value: studentCount },
          { icon: '👨‍🏫', label: 'Instructors', value: instructorCount },
          { icon: '📚', label: 'Courses',     value: stats?.courses?.total || 0 },
          { icon: '✅', label: 'Published',   value: stats?.courses?.published || 0 },
        ].map(({ icon, label, value }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <div className="font-display font-bold text-xl">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Users</h2>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-medium">{u.full_name}</td>
                    <td className="px-5 py-3 text-slate-400">{u.email}</td>
                    <td className="px-5 py-3 capitalize">
                      <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-xs ${
                        u.is_active
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleUser(u.id)}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
