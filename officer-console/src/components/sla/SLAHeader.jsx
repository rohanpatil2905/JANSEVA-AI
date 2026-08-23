import React from 'react';
import { Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SLAHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Breadcrumb & Title */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          JanSeva AI / SLA & Escalation
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em' }}>
              SLA & Escalation Command Center
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
              Monitor grievance resolution deadlines, escalation pressure, and departmental service performance.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-critical-bg)',
              border: '1px solid var(--color-critical-border)',
              color: 'var(--color-critical)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={14} />
            <span>Operational Resolution Deadlines</span>
          </div>
        </div>
      </div>

      {/* Governance Notice Banner */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <ShieldCheck size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--color-primary)' }}>OPERATIONAL GOVERNANCE NOTE:</strong> SLA intelligence is operational decision support. Officers retain statutory authority for escalation and resolution.
        </div>
      </div>
    </div>
  );
}
