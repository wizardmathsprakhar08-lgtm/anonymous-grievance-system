import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-500/20 text-rose-400 border-rose-500/30"
  };

  const labels = {
    submitted: "Submitted",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected"
  };

  const normalizedStatus = status ? status.toLowerCase() : "submitted";
  const badgeStyle = styles[normalizedStatus] || styles.submitted;
  const label = labels[normalizedStatus] || normalizedStatus;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
