import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Building2, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import Timeline from '../components/Timeline';
import { apiFetch } from '../api/config';

const TrackStatus = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [trackingId, setTrackingId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grievance, setGrievance] = useState(null);

  const handleSearch = async (idToFetch) => {
    const targetId = (idToFetch || trackingId).trim();
    if (!targetId) return;

    setLoading(true);
    setError('');
    setGrievance(null);

    try {
      const res = await apiFetch(`/grievances/${encodeURIComponent(targetId)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Grievance not found. Please check your tracking ID and try again.');
        }
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to fetch status');
      }

      const data = await res.json();
      setGrievance(data);
      setSearchParams({ id: targetId });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Track Anonymous Grievance Status
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
          Enter your 16-character tracking ID (e.g. AGY-XXXX-XXXX-XXXX) to check real-time status and officer action log.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={onSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-700 shadow-lg">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g., AGY-A1B2-C3D4-E5F6)"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !trackingId.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Status</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/70 border border-rose-600/50 text-rose-200 text-sm p-4 rounded-xl flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grievance Details & Timeline Display */}
      {grievance && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tracking ID</span>
                <span className="font-mono font-bold text-emerald-400">{grievance.tracking_id}</span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-slate-400" />
                <span>{grievance.department_name}</span>
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <UrgencyBadge level={grievance.urgency_level} score={grievance.urgency_score} />
              <StatusBadge status={grievance.status} />
            </div>
          </div>

          {/* Grievance Text */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sanitized Grievance Text</span>
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {grievance.sanitized_text}
            </p>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">Submitted On</span>
              <span className="font-medium text-slate-200">{new Date(grievance.created_at).toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">Last Updated</span>
              <span className="font-medium text-slate-200">{new Date(grievance.updated_at).toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">Duplicate Status</span>
              <span className="font-medium text-slate-200">
                {grievance.is_duplicate ? `Yes (Ref #${grievance.duplicate_of_id})` : 'Unique Complaint'}
              </span>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Resolution Progress & Action History</span>
            </h3>
            <Timeline logs={grievance.status_logs} />
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackStatus;
