import React from 'react';
import { History, ShieldCheck, Download } from 'lucide-react';

export default function AuditHeader({ onExport, recordCount = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Breadcrumb & Title */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          JanSeva AI / Audit Logs
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Audit Logs & Statutory Compliance
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
              Immutable operational history of citizen grievances, AI decisions, officer actions, escalations, and resolution events.
            </p>
          </div>

          <button
            type="button"
            onClick={onExport}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>Export Audit Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Governance Banner */}
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
          <strong style={{ color: 'var(--color-primary)' }}>STATUTORY COMPLIANCE NOTE:</strong> Audit records provide complete traceability for municipal operations. AI outputs are advisory; statutory responsibility remains with authorized officers.
        </div>
      </div>
    </div>
  );
}
