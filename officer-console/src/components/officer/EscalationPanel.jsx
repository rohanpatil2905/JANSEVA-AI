import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ArrowUpRight, Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { escalateComplaint } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ESCALATION_REASONS = [
  'SLA resolution deadline breach imminent (< 2 hours)',
  'Critical public safety / health emergency requires multi-department coordination',
  'Field crew resource and heavy machinery deficit',
  'Repeated multi-society public grievance cluster',
  'Contractor non-performance or delay',
  'Other statutory administrative escalation',
];

export default function EscalationPanel({
  isOpen,
  onClose,
  complaint,
  onEscalationSuccess,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const currentLevel = complaint?.escalationLevel || 1;
  const nextLevel = Math.min(currentLevel + 1, 3);

  const [targetLevel, setTargetLevel] = useState(nextLevel);
  const [reason, setReason] = useState(ESCALATION_REASONS[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const getTargetRoleName = level => {
    switch (level) {
      case 3:
        return 'Senior Municipal Commissioner (IAS)';
      case 2:
        return 'Zonal Ward Officer / Department Head';
      case 1:
      default:
        return 'Assigned Department Field Supervisor';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!reason.trim()) {
      showWarning('Please select a valid justification reason for escalation.', 'Reason Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await escalateComplaint(complaint.complaintId, {
        targetLevel,
        targetRole: getTargetRoleName(targetLevel),
        reason,
        note: note.trim(),
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess(`Complaint escalated to Level ${targetLevel} (${getTargetRoleName(targetLevel)}).`, 'Grievance Escalated');
      onEscalationSuccess?.(updated);
      setNote('');
      onClose();
    } catch (err) {
      console.error(err);
      showError('Failed to escalate complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ESCALATE MUNICIPAL GRIEVANCE"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Warning Header */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-critical-bg)',
            border: '1px solid var(--color-critical-border)',
            fontSize: '0.75rem',
            color: 'var(--color-critical)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Administrative Escalation:</strong> Increases ticket visibility to senior leadership and expedites emergency inter-departmental authorization.
          </div>
        </div>

        {/* Current State Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '10px 12px',
            backgroundColor: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '0.75rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Tier</span>
            <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>Level {currentLevel}</div>
          </div>
          <div>
            <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>SLA Status</span>
            <div style={{ fontWeight: 800, color: complaint.slaStatus === 'BREACHED' ? 'var(--color-critical)' : 'var(--color-high)', marginTop: '2px' }}>
              {complaint.slaStatus} ({complaint.slaRemainingHours > 0 ? `${complaint.slaRemainingHours}h remaining` : 'Breached'})
            </div>
          </div>
        </div>

        {/* Escalation Target Level */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Escalation Target Authority *
          </label>
          <select
            value={targetLevel}
            onChange={e => setTargetLevel(parseInt(e.target.value, 10))}
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
            <option value={2}>Level 2 — Zonal Ward Officer / Department Head</option>
            <option value={3}>Level 3 — Senior Municipal Commissioner (IAS)</option>
          </select>
        </div>

        {/* Escalation Reason */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Mandatory Escalation Justification *
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
            {ESCALATION_REASONS.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Note */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>
            Administrative Briefing Note (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Requires emergency funding authorization for 600mm feeder line excavation and traffic police diversion permit."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Controls */}
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
            <ArrowUpRight size={15} />
            <span>{isSubmitting ? 'Escalating...' : `Escalate to Level ${targetLevel}`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
