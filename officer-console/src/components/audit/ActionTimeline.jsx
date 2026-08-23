import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  BrainCircuit,
  User,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export default function ActionTimeline({ auditHistory = [] }) {
  const navigate = useNavigate();

  const getActorMeta = role => {
    switch (role) {
      case 'AI Engine':
        return {
          icon: BrainCircuit,
          bg: 'var(--color-ai-tint)',
          color: 'var(--color-ai)',
          border: 'var(--color-ai-border)',
        };
      case 'Citizen':
        return {
          icon: User,
          bg: 'var(--color-primary-tint)',
          color: 'var(--color-primary)',
          border: 'var(--color-border)',
        };
      case 'System':
      case 'System Monitor':
        return {
          icon: Clock,
          bg: 'var(--color-surface-sunken)',
          color: 'var(--color-ink-muted)',
          border: 'var(--color-border)',
        };
      default: // Municipal Officer / Engineers
        return {
          icon: ShieldCheck,
          bg: 'var(--color-healthy-bg)',
          color: 'var(--color-healthy)',
          border: 'var(--color-healthy-border)',
        };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--color-primary)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Immutable Investigation Ledger & Audit Trail
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', margin: '2px 0 0' }}>
              Statutory verification trail tracking citizen reports, AI inferences, and officer operational actions
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/audit-logs')}
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
        >
          Full Ledger <ArrowRight size={13} />
        </button>
      </div>

      {/* Chronological Vertical Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
        {auditHistory.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>
            No audit events recorded yet.
          </div>
        ) : (
          auditHistory.map((item, index) => {
            const meta = getActorMeta(item.role);
            const Icon = meta.icon;

            return (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                {/* Node Avatar Icon */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: meta.bg,
                    border: `1px solid ${meta.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    zIndex: 2,
                  }}
                >
                  <Icon size={14} color={meta.color} />
                </div>

                {/* Timeline Content Block */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-sunken)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {item.action}
                    </div>
                    <div className="mono" style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })},{' '}
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                    Actor: <strong style={{ color: 'var(--color-ink)' }}>{item.actor}</strong>{' '}
                    <span
                      style={{
                        marginLeft: '4px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.role}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
