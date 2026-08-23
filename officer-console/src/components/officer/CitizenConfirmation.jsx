import React, { useState } from 'react';
import { UserCheck, CheckCircle2, AlertCircle, RotateCcw, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { confirmCitizenResolution } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function CitizenConfirmation({
  complaint,
  onConfirmationSaved,
  onTriggerReopen,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint || (complaint.status !== 'Resolved' && complaint.status !== 'Citizen Confirmed')) {
    return null;
  }

  const isAlreadyConfirmed = complaint.status === 'Citizen Confirmed';

  const handleConfirmCitizen = async () => {
    setIsSubmitting(true);
    try {
      const updated = await confirmCitizenResolution(complaint.complaintId, {
        confirmed: true,
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess('Citizen resolution confirmation verified and recorded.', 'Case Closed');
      onConfirmationSaved?.(updated);
    } catch (err) {
      console.error(err);
      showError('Failed to confirm resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: isAlreadyConfirmed ? 'var(--color-healthy-bg)' : 'var(--color-surface)',
        border: isAlreadyConfirmed ? '1px solid var(--color-healthy-border)' : '1px solid var(--color-primary-light)',
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
                backgroundColor: isAlreadyConfirmed ? 'var(--color-healthy)' : 'var(--color-primary-tint)',
                color: isAlreadyConfirmed ? '#FFFFFF' : 'var(--color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <UserCheck size={13} /> CITIZEN CONFIRMATION PROTOCOL
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            {isAlreadyConfirmed ? 'Citizen Resolution Confirmed & Closed' : 'Awaiting Citizen Resolution Verification'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            {isAlreadyConfirmed
              ? 'The complainant verified on-ground resolution and closed the ticket with 5-star rating.'
              : 'Resolution SMS & WhatsApp dispatch sent to complainant. Awaiting citizen confirmation.'}
          </p>
        </div>

        <div
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isAlreadyConfirmed ? '#FFFFFF' : 'var(--color-surface-sunken)',
            border: isAlreadyConfirmed ? '1px solid var(--color-healthy-border)' : '1px solid var(--color-border)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Citizen State
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: isAlreadyConfirmed ? 'var(--color-healthy)' : 'var(--color-primary)' }}>
            {isAlreadyConfirmed ? '✓ Confirmed Satisfied' : 'Pending Response'}
          </div>
        </div>
      </div>

      {/* Action Buttons for Prototype Simulation */}
      {!isAlreadyConfirmed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingTop: '10px',
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleConfirmCitizen}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-healthy)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <ThumbsUp size={13} />
            {isSubmitting ? 'Recording...' : 'Record Citizen Confirmed'}
          </button>

          <button
            onClick={onTriggerReopen}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-critical)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: '1px solid var(--color-critical-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <ThumbsDown size={13} />
            Citizen Reported Issue Persists (Reopen)
          </button>
        </div>
      )}
    </div>
  );
}
