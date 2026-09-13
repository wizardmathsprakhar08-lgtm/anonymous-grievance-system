import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, AlertTriangle, ShieldCheck, Clock, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api/config';

const AdminDashboard = ({ authUser, token }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authUser || !token) {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [authUser, token]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to fetch analytics');
      }

      const resData = await res.json();
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const URGENCY_COLORS = {
    low: '#64748b',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  const STATUS_COLORS = {
    submitted: '#3b82f6',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    rejected: '#f43f5e'
  };

  const deptChartData = data ? Object.entries(data.by_department).map(([name, count]) => ({
    name: name.replace(' Department', '').replace(' Management', ''),
    count
  })) : [];

  const urgencyChartData = data ? Object.entries(data.by_urgency).map(([level, count]) => ({
    name: level.toUpperCase(),
    value: count,
    color: URGENCY_COLORS[level] || '#64748b'
  })) : [];

  const statusChartData = data ? Object.entries(data.by_status).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count,
    color: STATUS_COLORS[status] || '#64748b'
  })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>System Analytics & Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Administrator Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time public grievance resolution metrics and AI classification breakdown.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/70 border border-rose-600/50 text-rose-200 text-sm p-4 rounded-xl flex items-center space-x-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading || !data ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm">Calculating analytics metrics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Grievances</span>
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-3xl font-extrabold text-white">{data.total_grievances}</span>
              <span className="text-xs text-slate-400 block mt-1">Ingested via Multi-Agent AI</span>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Resolved Rate</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-3xl font-extrabold text-emerald-400">
                {data.total_grievances > 0
                  ? `${Math.round((data.by_status.resolved / data.total_grievances) * 100)}%`
                  : '0%'}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                {data.by_status.resolved} of {data.total_grievances} cases resolved
              </span>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Duplicates Flagged</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-3xl font-extrabold text-amber-400">{data.duplicate_count}</span>
              <span className="text-xs text-slate-400 block mt-1">TF-IDF & Cosine similarity</span>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution Time</span>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-3xl font-extrabold text-blue-400">{data.avg_resolution_hours}h</span>
              <span className="text-xs text-slate-400 block mt-1">Average hours to resolve</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bar Chart: Grievances per Department */}
            <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Grievance Distribution by Department</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Urgency Breakdown */}
            <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Urgency & Priority Classification</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={urgencyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {urgencyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
