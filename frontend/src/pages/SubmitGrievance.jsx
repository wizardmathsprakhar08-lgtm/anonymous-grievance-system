import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Send, Copy, Check, Sparkles, AlertTriangle, ArrowRight, EyeOff } from 'lucide-react';
import UrgencyBadge from '../components/UrgencyBadge';
import { apiFetch } from '../api/config';

const SubmitGrievance = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [categoryHint, setCategoryHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.length < 5) {
      setError('Please provide a detailed grievance description (minimum 5 characters).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          category_hint: categoryHint || null
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to submit grievance');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.tracking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Agent AI Pipeline Active</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Report Public Issue Anonymously
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Submit grievances without signing in. Our automated AI pipeline automatically scrubs personal info, evaluates urgency, detects duplicates, and assigns your issue to the correct authority.
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 mb-6 flex items-start space-x-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <EyeOff className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="text-xs sm:text-sm text-slate-300">
          <strong className="text-slate-100 font-semibold block mb-0.5">100% Anonymous & Private</strong>
          The <span className="text-emerald-400 font-medium">IntakeAgent</span> scrubs names, phone numbers, and email addresses via regex rules before processing. No IP address or login identity is stored.
        </div>
      </div>

      {/* Main Submission Form */}
      {!result ? (
        <form onSubmit={handleSubmit} className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 bg-rose-950/70 border border-rose-600/50 text-rose-200 text-sm p-4 rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grievance Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Grievance Description <span className="text-emerald-400">*</span>
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the issue in detail (e.g., Severe water leakage on Main Street near house #42. Water is overflowing into the road causing traffic jams...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
              <span>Be as descriptive as possible. High urgency keywords boost priority automatically.</span>
              <span>{text.length} chars</span>
            </div>
          </div>

          {/* Category Dropdown Hint */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Department Category Hint <span className="text-slate-400 font-normal">(Optional AI Assist)</span>
            </label>
            <select
              value={categoryHint}
              onChange={(e) => setCategoryHint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
            >
              <option value="">Let AI ClassificationAgent Auto-Detect</option>
              <option value="water">Water Supply Department</option>
              <option value="road">Roads & Infrastructure</option>
              <option value="electricity">Electricity & Power</option>
              <option value="sanitation">Sanitation & Waste Management</option>
              <option value="corruption">Anti-Corruption & Governance</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Multi-Agent Pipeline Processing...</span>
              </div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Grievance Anonymously</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Success Card with Tracking ID & Agent Diagnostics */
        <div className="bg-slate-800 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Grievance Submitted Successfully!</h2>
                <p className="text-xs text-slate-400">Save your anonymous tracking ID to monitor resolution progress.</p>
              </div>
            </div>
          </div>

          {/* Tracking ID Copy Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Tracking ID</span>
              <span className="text-xl font-mono font-bold text-emerald-400 tracking-wider">{result.tracking_id}</span>
            </div>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-600 flex items-center justify-center space-x-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Tracking ID</span>
                </>
              )}
            </button>
          </div>

          {/* AI Pipeline Agent Results */}
          <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/50 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Agent AI Analysis Output</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block">Assigned Department</span>
                <span className="text-sm font-semibold text-slate-100">{result.department_name}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Evaluated Urgency</span>
                  <span className="text-xs text-slate-300">Score: {(result.urgency_score * 100).toFixed(0)}%</span>
                </div>
                <UrgencyBadge level={result.urgency_level} score={result.urgency_score} />
              </div>
            </div>

            {/* Sanitized Text Preview */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Sanitized Text (PII Redacted)</span>
              <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded border border-slate-800">
                "{result.sanitized_text}"
              </p>
            </div>

            {result.is_duplicate && (
              <div className="bg-amber-950/50 border border-amber-600/40 p-3 rounded-lg text-xs text-amber-300">
                ⚠️ <strong>Duplicate Flagged:</strong> SimilarityAgent detected cosine match with Grievance #{result.duplicate_of_id}.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(`/track?id=${result.tracking_id}`)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Track Status Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setResult(null);
                setText('');
                setCategoryHint('');
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              File Another Grievance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitGrievance;
