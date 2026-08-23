import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { reopenComplaint } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const REOPEN_REASONS = [
  'Citizen reported issue persists on ground',
  'Field inspection indicates incomplete repair',
  'Problem recurred within 48 hours',
  'Citizen disputed resolution satisfaction',
  'New photographic evidence submitted by resident group',
  'Other operational deficiency',
];

export default function ReopenPanel({
  isOpen,
  onClose,
  complaint,
  onReopenSuccess,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const [reason, setReason] = useState(REOPEN_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const handleSubmit = async e => {
    e.preventDefault();

    if (!reason) {
      showWarning('Please select a valid reason for reopening the complaint.', 'Reason Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await reopenComplaint(complaint.complaintId, {
        reason,
        details: details.trim(),
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess('Complaint reopened for further operational action.', 'Complaint Reopened');
      onReopenSuccess?.(updated);
      setDetails('');
      onClose();
    } catch (err) {
      console.error(err);
      showError('Failed to reopen complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="REOPEN GRIEVANCE INVESTIGATION"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-critical-bg)',
            border: '1px solid var(--color-critical-border)',
            fontSize: '0.72rem',
            color: 'var(--color-critical)',
          }}
        >
          <strong>Governance Notice:</strong> Reopening resets the grievance to <strong>REOPENED</strong> status and alerts the assigned department supervisor for priority field action.
        </div>

        {/* Reason Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Mandatory Reopening Justification *
          </label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            {REOPEN_REASONS.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Details */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>
            Specific Dispute Observations & Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Complainant reported that low water pressure recurred after valve adjustment..."
            value={details}
            onChange={e => setDetails(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '14px',
            borderTop: '1px solid var(--color-border)',
            marginTop: '4px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '40px',
              padding: '0 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-critical)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <RotateCcw size={15} />
            <span>{isSubmitting ? 'Reopening...' : 'Confirm Reopen Ticket'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
