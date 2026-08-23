import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AuthenticityCard({
  authenticityScore = 96,
  authenticityStatus = 'Likely Genuine',
  authenticityReasons = [],
  onUpdateStatus,
}) {
  const { showSuccess, showWarning } = useToast();
  const [currentStatus, setCurrentStatus] = useState(authenticityStatus);
  const [currentScore, setCurrentScore] = useState(authenticityScore);

  const isSuspicious = currentStatus === 'Suspicious';
  const isNeedsReview = currentStatus === 'Needs Verification';

  const handleAction = (newStatus, newScore, msg, type = 'success') => {
    setCurrentStatus(newStatus);
    setCurrentScore(newScore);
    onUpdateStatus?.(newStatus, newScore);
    if (type === 'warning') {
      showWarning(msg, 'Authenticity Updated');
    } else {
      showSuccess(msg, 'Authenticity Verified');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isSuspicious ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isSuspicious ? 'var(--color-critical-bg)' : 'var(--color-healthy-bg)',
                color: isSuspicious ? 'var(--color-critical)' : 'var(--color-healthy)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {isSuspicious ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
              AUTHENTICITY & ANTI-ABUSE VERIFICATION
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Civic Integrity & Authenticity Analysis
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Heuristic fraud, bot pattern, and cellular tower geolocation validation
          </p>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isSuspicious ? 'var(--color-critical-bg)' : isNeedsReview ? 'var(--color-high-bg)' : 'var(--color-healthy-bg)',
            border: isSuspicious ? '1px solid var(--color-critical-border)' : isNeedsReview ? '1px solid var(--color-high-border)' : '1px solid var(--color-healthy-border)',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: isSuspicious ? 'var(--color-critical)' : isNeedsReview ? 'var(--color-high)' : 'var(--color-healthy)',
              textTransform: 'uppercase',
            }}
          >
            {currentStatus}
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isSuspicious ? 'var(--color-critical)' : isNeedsReview ? 'var(--color-high)' : 'var(--color-healthy)',
              lineHeight: 1.1,
            }}
          >
            {currentScore} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Signals Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {authenticityReasons.length === 0 ? (
          <div style={{ padding: '10px', color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>
            Telemetry validated via standard citizen OTP authentication.
          </div>
        ) : (
          authenticityReasons.map((reason, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                fontSize: '0.78125rem',
                color: 'var(--color-ink)',
              }}
            >
              {isSuspicious ? (
                <XCircle size={14} color="var(--color-critical)" style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={14} color="var(--color-healthy)" style={{ flexShrink: 0 }} />
              )}
              <span>{reason}</span>
            </div>
          ))
        )}
      </div>

      {/* Officer Integrity Verification Triggers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
          Officer Action:
        </span>

        <button
          onClick={() => handleAction('Likely Genuine', 98, 'Marked as verified and genuine citizen grievance.', 'success')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--color-healthy-border)',
            backgroundColor: 'var(--color-healthy-bg)',
            color: 'var(--color-healthy)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ✓ Mark Likely Genuine
        </button>

        <button
          onClick={() => handleAction('Needs Verification', 70, 'Grievance flagged for field verification.', 'warning')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--color-moderate-border)',
            backgroundColor: 'var(--color-moderate-bg)',
            color: 'var(--color-moderate)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⚠ Flag for Field Verification
        </button>

        <button
          onClick={() => handleAction('Suspicious', 20, 'Grievance flagged as coordinated abuse/bot spam.', 'warning')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--color-critical-border)',
            backgroundColor: 'var(--color-critical-bg)',
            color: 'var(--color-critical)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ✕ Flag Suspicious Pattern
        </button>
      </div>
    </div>
  );
}
