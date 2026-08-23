import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function SLASummaryCard({ complaint }) {
  const navigate = useNavigate();

  if (!complaint) return null;

  const isBreached = complaint.slaStatus === 'BREACHED';
  const isAtRisk = complaint.slaStatus === 'AT RISK';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isBreached ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color={isBreached ? 'var(--color-critical)' : isAtRisk ? 'var(--color-high)' : 'var(--color-healthy)'} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            SLA & Escalation Status
          </h3>
        </div>
        <button
          onClick={() => navigate('/sla')}
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
          }}
        >
          View SLA Policy <ArrowRight size={12} />
        </button>
      </div>

      {/* SLA Metric Box */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isBreached ? 'var(--color-critical-bg)' : isAtRisk ? 'var(--color-high-bg)' : 'var(--color-healthy-bg)',
          border: isBreached ? '1px solid var(--color-critical-border)' : isAtRisk ? '1px solid var(--color-high-border)' : '1px solid var(--color-healthy-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: isBreached ? 'var(--color-critical)' : isAtRisk ? 'var(--color-high)' : 'var(--color-healthy)',
              textTransform: 'uppercase',
            }}
          >
            Resolution SLA: {complaint.slaStatus}
          </div>
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: isBreached ? 'var(--color-critical)' : isAtRisk ? 'var(--color-high)' : 'var(--color-healthy)',
              marginTop: '2px',
            }}
          >
            {complaint.slaRemainingHours > 0 ? `${complaint.slaRemainingHours} Hours Remaining` : 'SLA Deadline Breached'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>Escalation Level</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            {complaint.priority === 'Critical' ? 'Level 2 (Commissioner)' : 'Level 1 (Zonal Head)'}
          </div>
        </div>
      </div>

      {/* Deadline Info */}
      <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>
          Statutory Deadline:{' '}
          <strong>
            {new Date(complaint.slaDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
            {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </strong>
        </span>
        <span>Target: <strong>48 Hours (Charter)</strong></span>
      </div>
    </div>
  );
}
