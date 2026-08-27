import React from 'react';

export function SeverityBadge({ level }) {
  const normalized = String(level || 'LOW').toUpperCase();
  const badgeClass = {
    CRITICAL: 'badge-critical',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
  }[normalized] || 'badge-low';

  return (
    <span className={`badge ${badgeClass}`}>
      {normalized === 'CRITICAL' && '🔴 '}
      {normalized === 'HIGH' && '🟠 '}
      {normalized === 'MEDIUM' && '🟡 '}
      {normalized === 'LOW' && '🟢 '}
      {normalized}
    </span>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status || 'submitted').toLowerCase();
  const labelMap = {
    submitted: 'Submitted',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    reopened: 'Reopened',
  };

  const badgeClass = {
    submitted: 'badge-submitted',
    in_progress: 'badge-in_progress',
    resolved: 'badge-resolved',
    closed: 'badge-closed',
    reopened: 'badge-reopened',
  }[normalized] || 'badge-submitted';

  return (
    <span className={`badge ${badgeClass}`}>
      {labelMap[normalized] || normalized}
    </span>
  );
}

export function SlaBadge({ isBreached, status }) {
  if (isBreached || status === 'BREACHED') {
    return <span className="badge badge-critical">⚠️ SLA Breached</span>;
  }
  if (status === 'RESOLVED') {
    return <span className="badge badge-resolved">✓ Met SLA</span>;
  }
  return <span className="badge badge-submitted">⏱️ Active SLA</span>;
}

export default { SeverityBadge, StatusBadge, SlaBadge };
