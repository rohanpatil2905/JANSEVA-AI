import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';

export default function SLAAlert({ stats = {}, complaints = [] }) {
  const navigate = useNavigate();

  // Filter complaints that are BREACHED or AT RISK
  const criticalSlaList = complaints
    .filter(c => c.slaStatus === 'BREACHED' || c.slaStatus === 'AT RISK')
    .slice(0, 4);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-critical-bg)',
              color: 'var(--color-critical)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)' }}>
              SLA Risk & Escalation Alerts
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
              Service delivery deadlines approaching threshold
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/sla')}
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Inspect SLA &rarr;
        </button>
      </div>

      {/* 3 Summary Badges / Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div
          style={{
            backgroundColor: 'var(--color-critical-bg)',
            border: '1px solid var(--color-critical-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-critical)' }}>
            {stats.slaBreached ?? 3}
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-critical)', textTransform: 'uppercase' }}>
            Breached
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-high-bg)',
            border: '1px solid var(--color-high-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-high)' }}>
            {stats.slaDueWithin4Hours ?? 7}
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-high)', textTransform: 'uppercase' }}>
            Due &lt; 4 Hours
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            {stats.slaApproachingLimit ?? 12}
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Approaching
          </div>
        </div>
      </div>

      {/* Urgent SLA Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {criticalSlaList.map(item => (
          <div
            key={item.complaintId}
            onClick={() => navigate(`/complaints/${item.complaintId}`)}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-sunken)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              cursor: 'pointer',
              transition: 'background-color 0.1s ease',
            }}
            className="hover-bg-sunken"
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                  {item.complaintId}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: item.slaStatus === 'BREACHED' ? 'var(--color-critical-bg)' : 'var(--color-high-bg)',
                    color: item.slaStatus === 'BREACHED' ? 'var(--color-critical)' : 'var(--color-high)',
                  }}
                >
                  {item.slaStatus === 'BREACHED' ? 'BREACHED' : 'AT RISK'}
                </span>
              </div>
              <div style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: item.slaStatus === 'BREACHED' ? 'var(--color-critical)' : 'var(--color-high)' }}>
                {item.slaRemainingHours > 0 ? `${item.slaRemainingHours}h remaining` : 'Overdue'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>
                {item.ward}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
