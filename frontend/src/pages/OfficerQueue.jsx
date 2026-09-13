import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTodo, Filter, Search, ShieldAlert, RefreshCw, Eye, Building2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import GrievanceDetail from './GrievanceDetail';
import { apiFetch } from '../api/config';

const OfficerQueue = ({ authUser, token }) => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  useEffect(() => {
    if (!authUser || !token) {
      navigate('/login');
      return;
    }
    fetchQueue();
  }, [authUser, token, statusFilter]);

  const fetchQueue = async () => {
    setLoading(true);
    setError('');

    try {
      let url = '/officer/queue';
      if (statusFilter) {
        url += `?status_filter=${encodeURIComponent(statusFilter)}`;
      }

      const res = await apiFetch(url, {
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
        throw new Error(errData.detail || 'Failed to load queue');
      }

      const data = await res.json();
      setQueue(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedItem) => {
    setQueue(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const filteredQueue = queue.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.tracking_id.toLowerCase().includes(term) ||
      item.sanitized_text.toLowerCase().includes(term) ||
      item.department_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{authUser?.role === 'admin' ? 'All Departments Queue (Admin)' : (authUser?.department_name || 'Department Queue')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Officer Redressal Queue
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Grievances prioritized automatically by AI Urgency score.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="self-start md:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tracking ID or text..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: '', label: 'All Statuses' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/70 border border-rose-600/50 text-rose-200 text-sm p-4 rounded-xl flex items-center space-x-2 mb-6">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grievances Queue Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm">Loading prioritize queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-300">No grievances found in queue</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or checking back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Tracking ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Grievance Summary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-xs">
                {filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedGrievance(item)}
                    className="hover:bg-slate-700/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <UrgencyBadge level={item.urgency_level} score={item.urgency_score} />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {item.tracking_id}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                      {item.department_name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-md">
                      <p className="truncate font-sans">{item.sanitized_text}</p>
                      {item.is_duplicate && (
                        <span className="text-[10px] font-semibold text-amber-400 mt-0.5 inline-block">
                          ⚠️ Duplicate Flagged (Ref #{item.duplicate_of_id})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGrievance(item);
                        }}
                        className="p-1.5 bg-slate-700 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white rounded-lg transition-colors inline-flex items-center space-x-1 px-2.5 py-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[11px]">Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grievance Detail Modal */}
      {selectedGrievance && (
        <GrievanceDetail
          grievance={selectedGrievance}
          token={token}
          onClose={() => setSelectedGrievance(null)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default OfficerQueue;
