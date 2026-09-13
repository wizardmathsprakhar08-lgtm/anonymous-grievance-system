import React from 'react';

const UrgencyBadge = ({ level, score }) => {
  const styles = {
    critical: "bg-red-950/80 text-red-300 border-red-600/60 shadow-red-900/40 shadow-sm",
    high: "bg-orange-950/60 text-orange-300 border-orange-600/40",
    medium: "bg-amber-950/50 text-amber-300 border-amber-600/30",
    low: "bg-slate-800 text-slate-300 border-slate-700"
  };

  const normalizedLevel = level ? level.toLowerCase() : "low";
  const style = styles[normalizedLevel] || styles.low;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${style}`}>
      {normalizedLevel === 'critical' && <span className="mr-1">🚨</span>}
      {normalizedLevel}
      {score !== undefined && score !== null && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">({Math.round(score * 100)}%)</span>
      )}
    </span>
  );
};

export default UrgencyBadge;
