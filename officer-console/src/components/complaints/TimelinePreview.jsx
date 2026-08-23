import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowRight, CheckCircle2, Clock, User, BrainCircuit } from 'lucide-react';

export default function TimelinePreview({ auditHistory = [] }) {
  const navigate = useNavigate();

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
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Audit History & Investigation Timeline
          </h3>
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
            gap: '3px',
            cursor: 'pointer',
          }}
        >
          View Full Audit Trail <ArrowRight size={12} />
        </button>
      </div>

      {/* Timeline Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '8px' }}>
        {auditHistory.length === 0 ? (
          <div style={{ padding: '12px', color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>
            No previous audit records found.
          </div>
        ) : (
          auditHistory.map((item, index) => {
            const isAI = item.role === 'AI Engine';
            const isCitizen = item.role === 'Citizen';

            return (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isAI ? 'var(--color-ai-tint)' : isCitizen ? 'var(--color-primary-tint)' : 'var(--color-healthy-bg)',
                    border: isAI ? '1px solid var(--color-ai-border)' : '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {isAI ? (
                    <BrainCircuit size={13} color="var(--color-ai)" />
                  ) : (
                    <User size={13} color={isCitizen ? 'var(--color-primary)' : 'var(--color-healthy)'} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {item.action}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    Actor: <strong>{item.actor}</strong> ({item.role})
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
