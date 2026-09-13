import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle, AlertTriangle, Clock, ArrowRight, UserCheck, MessageSquare } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import Timeline from '../components/Timeline';
import { apiFetch } from '../api/config';

const GrievanceDetail = ({ grievance, onClose, onUpdateSuccess, token }) => {
  const [newStatus, setNewStatus] = useState(grievance.status);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      const res = await apiFetch(`/officer/grievances/${grievance.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_status: newStatus,
          note: note.trim() || null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to update status');
      }

      const updatedData = await res.json();
      onUpdateSuccess(updatedData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-12">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <span>Tracking ID:</span>
            <span className="font-bold">{grievance.tracking_id}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {grievance.department_name} Complaint Inspection
          </h2>
          <div className="flex items-center space-x-3 mt-3">
            <UrgencyBadge level={grievance.urgency_level} score={grievance.urgency_score} />
            <StatusBadge status={grievance.status} />
            {grievance.is_duplicate && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Duplicate #{grievance.duplicate_of_id}
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/70 border border-rose-600/50 text-rose-200 text-sm p-4 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sanitized Text Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Sanitized Grievance Content
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            "{grievance.sanitized_text}"
          </p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleUpdate} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Update Resolution Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="submitted">Submitted (Pending)</option>
                <option value="in_progress">In Progress (Investigating)</option>
                <option value="resolved">Resolved (Completed)</option>
                <option value="rejected">Rejected (Invalid/Out of scope)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quick Actions</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setNewStatus('in_progress')}
                  className="flex-1 py-2 px-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-semibold rounded-lg border border-amber-700/50 transition-colors"
                >
                  Mark In-Progress
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('resolved')}
                  className="flex-1 py-2 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-700/50 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Officer Audit Note / Action Summary
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Dispatched maintenance team to site. Repair completed and verified."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {updating ? (
                <span>Updating...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Status Change</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Timeline Log */}
        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Audit Log & Timeline</span>
          </h3>
          <Timeline logs={grievance.status_logs} />
        </div>

      </div>
    </div>
  );
};

export default GrievanceDetail;
