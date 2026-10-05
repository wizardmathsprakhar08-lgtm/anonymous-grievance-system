import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, ShieldCheck, Clock, Building2, AlertTriangle, FileText, 
  Sparkles, CheckCircle2, Image as ImageIcon, Video, UserCheck, 
  Bookmark, ListFilter, ArrowRight, Eye, RefreshCw 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import Timeline from '../components/Timeline';
import { apiFetch } from '../api/config';

const TrackStatus = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [activeView, setActiveView] = useState(initialId ? 'track' : 'my_complaints'); // 'my_complaints' | 'track' | 'community'
  const [trackingId, setTrackingId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grievance, setGrievance] = useState(null);

  // My Complaints (Saved locally in app)
  const [myComplaints, setMyComplaints] = useState([]);

  // Community Feed
  const [communityGrievances, setCommunityGrievances] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'resolved' | 'in_progress' | 'submitted'

  useEffect(() => {
    // Load locally saved complaints from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('my_grievances') || '[]');
      setMyComplaints(saved);
      if (saved.length === 0 && !initialId) {
        setActiveView('community');
      }
    } catch (e) {
      console.warn('Failed to parse my_grievances', e);
    }
  }, []);

  const handleSearch = async (idToFetch) => {
    const targetId = (idToFetch || trackingId).trim();
    if (!targetId) return;

    setLoading(true);
    setError('');
    setGrievance(null);
    setActiveView('track');

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

  const fetchCommunityFeed = async () => {
    setFeedLoading(true);
    try {
      const statusQuery = feedFilter !== 'all' ? `?status=${feedFilter}` : '';
      const res = await apiFetch(`/grievances${statusQuery}`);
      if (res.ok) {
        const data = await res.json();
        setCommunityGrievances(data);
      }
    } catch (err) {
      console.error('Failed to load community feed', err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  useEffect(() => {
    if (activeView === 'community') {
      fetchCommunityFeed();
    }
  }, [activeView, feedFilter]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Public Complaints & Live Tracking
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
          View all complaints stored in the app, monitor officer resolutions, and inspect attached photo/video proof in real time.
        </p>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-center space-x-2 mt-6 p-1.5 bg-slate-900 border border-slate-800 rounded-xl inline-flex max-w-md mx-auto">
          <button
            onClick={() => setActiveView('my_complaints')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeView === 'my_complaints'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Complaints ({myComplaints.length})</span>
          </button>

          <button
            onClick={() => setActiveView('community')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeView === 'community'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Browse All Stored</span>
          </button>

          <button
            onClick={() => setActiveView('track')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeView === 'track'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track by ID</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MY SAVED COMPLAINTS IN THE APP */}
      {activeView === 'my_complaints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <span>Complaints Stored on This Device</span>
            </h2>
            <span className="text-xs text-slate-400">{myComplaints.length} complaint(s) recorded</span>
          </div>

          {myComplaints.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No complaints filed on this device yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When you submit a complaint, it will automatically be stored here so you never lose your tracking ID.
              </p>
              <button
                onClick={() => setActiveView('community')}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1.5"
              >
                <span>Browse All Community Complaints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myComplaints.map((item) => (
                <div
                  key={item.tracking_id}
                  onClick={() => handleSearch(item.tracking_id)}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-4 sm:p-5 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                        {item.tracking_id}
                      </span>
                      <span className="text-xs font-medium text-slate-300">
                        {item.department_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UrgencyBadge level={item.urgency_level} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 mt-3 line-clamp-2 leading-relaxed">
                    {item.sanitized_text || item.text}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
                    <span>Filed: {new Date(item.created_at).toLocaleDateString()}</span>
                    <span className="text-emerald-400 font-semibold group-hover:underline flex items-center space-x-1">
                      <span>View Live Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BROWSE ALL STORED PUBLIC COMPLAINTS */}
      {activeView === 'community' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ListFilter className="w-5 h-5 text-emerald-400" />
              <span>All Registered Complaints in Database</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {['all', 'resolved', 'in_progress', 'submitted'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFeedFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-colors ${
                    feedFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
              <button
                onClick={fetchCommunityFeed}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${feedLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {feedLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-400">Loading stored complaints from database...</p>
            </div>
          ) : communityGrievances.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-300">No complaints found matching this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {communityGrievances.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleSearch(g.tracking_id)}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-4 sm:p-5 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                        {g.tracking_id}
                      </span>
                      <span className="text-xs font-medium text-slate-300">
                        {g.department_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UrgencyBadge level={g.urgency_level} score={g.urgency_score} />
                      <StatusBadge status={g.status} />
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 mt-3 line-clamp-2 leading-relaxed">
                    {g.sanitized_text}
                  </p>

                  {/* Photo / Video Thumbnail if attached */}
                  {g.media_url && (
                    <div className="mt-3 flex items-center space-x-2 text-xs text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/50 w-fit">
                      {g.media_type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      <span>Evidence Attached ({g.media_type === 'video' ? 'Video' : 'Photo'})</span>
                    </div>
                  )}

                  {/* Officer Resolution Banner Preview */}
                  {g.status === 'resolved' && (
                    <div className="mt-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-3 text-xs text-emerald-300 flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block">
                          Resolved by: {g.resolved_by || 'Assigned Officer'}
                        </span>
                        {g.resolution_note && (
                          <p className="text-slate-300 mt-0.5 line-clamp-1 italic">
                            "{g.resolution_note}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
                    <span>Submitted: {new Date(g.created_at).toLocaleDateString()}</span>
                    <span className="text-emerald-400 font-semibold group-hover:underline flex items-center space-x-1">
                      <span>Inspect Details & Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TRACK SPECIFIC GRIEVANCE */}
      {activeView === 'track' && (
        <>
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

              {/* RESOLVED BY OFFICER BANNER (PROMINENTLY DISPLAYED) */}
              {grievance.status === 'resolved' && (
                <div className="bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-2 border-emerald-500/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                        <span>Complaint Resolved by Department Officer</span>
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium">
                        Official Action Taken & Case Closed
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-4 border border-emerald-500/30 space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-300">
                      <span className="flex items-center space-x-1.5 font-semibold text-white">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Resolving Officer: {grievance.resolved_by || 'Department Assigned Officer'}</span>
                      </span>
                      {grievance.resolved_at && (
                        <span className="text-slate-400 text-xs">
                          Resolved on: {new Date(grievance.resolved_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Officer's Official Resolution Note:
                      </span>
                      <p className="text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        {grievance.resolution_note || 'The reported issue was inspected on-site by the maintenance team and work has been completed.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grievance Text */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sanitized Grievance Description</span>
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {grievance.sanitized_text}
                </p>
              </div>

              {/* ATTACHED PHOTO OR VIDEO PROOF */}
              {grievance.media_url && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2 flex items-center space-x-1.5 text-emerald-400">
                    {grievance.media_type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    <span>Attached {grievance.media_type === 'video' ? 'Video' : 'Photo'} Evidence</span>
                  </span>

                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-96">
                    {grievance.media_type === 'video' ? (
                      <video
                        src={grievance.media_url}
                        controls
                        className="w-full max-h-96 object-contain"
                      />
                    ) : (
                      <img
                        src={grievance.media_url}
                        alt="Citizen Uploaded Evidence"
                        className="w-full max-h-96 object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

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
        </>
      )}
    </div>
  );
};

export default TrackStatus;
