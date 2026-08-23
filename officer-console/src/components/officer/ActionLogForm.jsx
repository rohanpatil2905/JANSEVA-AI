import React, { useState } from 'react';
import { ClipboardList, PlusCircle, Save, X, Activity } from 'lucide-react';
import Modal from '../ui/Modal';
import { recordComplaintAction } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ACTION_TYPES = [
  'Field Inspection',
  'Department Contacted',
  'Repair Team Dispatched',
  'Material Requested',
  'Citizen Contacted',
  'Temporary Mitigation',
  'Permanent Repair',
  'Evidence Collected',
  'Other',
];

export default function ActionLogForm({
  isOpen,
  onClose,
  complaint,
  onActionRecorded,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const [actionType, setActionType] = useState('Field Inspection');
  const [description, setDescription] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const handleSubmit = async e => {
    e.preventDefault();

    if (!description.trim()) {
      showWarning('Please enter a description of the operational action taken.', 'Description Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await recordComplaintAction(complaint.complaintId, {
        actionType,
        description: description.trim(),
        internalNote: internalNote.trim(),
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess(`Operational action "${actionType}" recorded successfully.`, 'Action Logged');
      onActionRecorded?.(updated);
      setDescription('');
      setInternalNote('');
      onClose();
    } catch (err) {
      console.error(err);
      showError('Failed to record action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RECORD OPERATIONAL ACTION"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', margin: 0 }}>
          Log municipal field investigations, crew dispatches, citizen calls, or material requisitions.
        </p>

        {/* Action Type */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Action Category *
          </label>
          <select
            value={actionType}
            onChange={e => setActionType(e.target.value)}
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
            {ACTION_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Operational Summary & Findings *
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Dispatched 4-member emergency plumbing crew with vacuum tanker to inspect valve chamber #4..."
            value={description}
            onChange={e => setDescription(e.target.value)}
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

        {/* Internal Note */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>
            Internal Department Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Requires approval for 600mm replacement gasket from Central Store"
            value={internalNote}
            onChange={e => setInternalNote(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
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
              backgroundColor: 'var(--color-primary)',
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
            <Save size={14} />
            <span>{isSubmitting ? 'Recording...' : 'Record Action'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
