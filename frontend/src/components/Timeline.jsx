import React from 'react';
import { Clock, CheckCircle2, AlertCircle, User, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const Timeline = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p className="text-slate-400 text-sm italic">No history available yet.</p>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-700 space-y-6 my-4">
      {logs.map((log, index) => {
        const dateStr = new Date(log.timestamp).toLocaleString();
        
        return (
          <div key={log.id || index} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/60 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  {log.previous_status && (
                    <>
                      <StatusBadge status={log.previous_status} />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </>
                  )}
                  <StatusBadge status={log.new_status} />
                </div>
                <div className="flex items-center text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {dateStr}
                </div>
              </div>

              {log.note && (
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                  {log.note}
                </p>
              )}

              {log.changed_by_username && (
                <div className="flex items-center mt-2 pt-2 border-t border-slate-700/40 text-xs text-slate-400">
                  <User className="w-3 h-3 mr-1 text-emerald-400" />
                  <span>Action taken by: <strong className="text-slate-200">{log.changed_by_username}</strong></span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
