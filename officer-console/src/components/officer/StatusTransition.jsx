import React from 'react';
import { Check, ArrowRight, Play, CheckCircle2, AlertTriangle, RotateCcw, XCircle, ShieldAlert } from 'lucide-react';
import StatusBadge from '../complaints/StatusBadge';

const LIFECYCLE_STEPS = [
  'Submitted',
  'AI Classified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Citizen Confirmed',
];

export default function StatusTransition({ currentStatus = 'Submitted', onTriggerAction }) {
  const getStepIndex = status => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'AI Classified':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      case 'Citizen Confirmed':
        return 5;
      case 'Escalated':
        return 3; // within in-progress branch
      case 'Reopened':
        return 3; // within in-progress branch
      case 'Rejected':
        return 1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isSpecialState = currentStatus === 'Escalated' || currentStatus === 'Reopened' || currentStatus === 'Rejected';

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
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)', letterSpacing: '0.04em' }}>
            LIFECYCLE STATUS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Current Status:
            </h3>
            <StatusBadge status={currentStatus} />
            {isSpecialState && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: currentStatus === 'Escalated' ? 'var(--color-critical)' : 'var(--color-high)',
                  backgroundColor: currentStatus === 'Escalated' ? 'var(--color-critical-bg)' : 'var(--color-high-bg)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: currentStatus === 'Escalated' ? '1px solid var(--color-critical-border)' : '1px solid var(--color-high-border)',
                }}
              >
                Special Operational Branch
              </span>
            )}
          </div>
        </div>

        {/* Permissible Fast Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {currentStatus === 'Assigned' && (
            <button
              onClick={() => onTriggerAction?.('start_work')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <Play size={12} /> Begin Field Action (In Progress)
            </button>
          )}

          {currentStatus === 'In Progress' && (
            <>
              <button
                onClick={() => onTriggerAction?.('resolve')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-healthy)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={12} /> Submit Resolution
              </button>
              <button
                onClick={() => onTriggerAction?.('escalate')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-critical-bg)',
                  color: 'var(--color-critical)',
                  border: '1px solid var(--color-critical-border)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={12} /> Escalate Ticket
              </button>
            </>
          )}

          {currentStatus === 'Escalated' && (
            <button
              onClick={() => onTriggerAction?.('resolve')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-healthy)',
                color: '#FFFFFF',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={12} /> Resolve Escalated Grievance
            </button>
          )}

          {currentStatus === 'Reopened' && (
            <button
              onClick={() => onTriggerAction?.('start_work')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <Play size={12} /> Re-commence Field Action
            </button>
          )}

          {currentStatus === 'Resolved' && (
            <>
              <button
                onClick={() => onTriggerAction?.('citizen_confirm')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-healthy)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={12} /> Citizen Confirmation
              </button>
              <button
                onClick={() => onTriggerAction?.('reopen')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-surface-sunken)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} /> Reopen Ticket
              </button>
            </>
          )}

          {currentStatus === 'Citizen Confirmed' && (
            <button
              onClick={() => onTriggerAction?.('reopen')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-surface-sunken)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} /> Reopen Closed Case
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Lifecycle Stepper Bar */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '600px', position: 'relative' }}>
          {LIFECYCLE_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted
                        ? 'var(--color-healthy)'
                        : isCurrent
                        ? 'var(--color-primary)'
                        : 'var(--color-surface-sunken)',
                      border: isCompleted
                        ? '2px solid var(--color-healthy)'
                        : isCurrent
                        ? '2px solid var(--color-primary)'
                        : '2px solid var(--color-border)',
                      color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--color-ink-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      zIndex: 2,
                    }}
                  >
                    {isCompleted ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                      color: isCurrent ? 'var(--color-primary)' : isCompleted ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                      marginTop: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step}
                  </span>
                </div>

                {index < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      backgroundColor: index < currentIndex ? 'var(--color-healthy)' : 'var(--color-border)',
                      marginTop: '-18px',
                      zIndex: 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
