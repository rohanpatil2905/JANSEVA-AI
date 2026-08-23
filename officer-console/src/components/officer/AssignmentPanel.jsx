import React, { useState } from 'react';
import { UserCheck, Building2, User, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { MUNICIPAL_DEPARTMENTS } from '../../data/mockData';
import { officers } from '../../mock/officers';
import { assignComplaint } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Drawer from '../ui/Drawer';

export default function AssignmentPanel({
  isOpen,
  onClose,
  complaint,
  onAssignmentSuccess,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const isReassign = Boolean(complaint?.assignedOfficer && complaint?.assignedOfficer !== 'UNASSIGNED');

  const [selectedDept, setSelectedDept] = useState(complaint?.department || MUNICIPAL_DEPARTMENTS.WATER);
  const [selectedOfficer, setSelectedOfficer] = useState(
    complaint?.assignedOfficer && complaint?.assignedOfficer !== 'UNASSIGNED'
      ? complaint.assignedOfficer
      : officers[0]?.name || ''
  );
  const [assignmentNote, setAssignmentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedOfficer) {
      showWarning('Please select a designated municipal officer.', 'Officer Required');
      return;
    }

    if (isReassign && !assignmentNote.trim()) {
      showWarning('Please provide a justification note for reassigning this ticket.', 'Reason Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await assignComplaint(complaint.complaintId, {
        department: selectedDept,
        assignedOfficer: selectedOfficer,
        note: assignmentNote.trim(),
        officerName: user?.name || 'Zonal Officer',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess(
        isReassign
          ? `Grievance reassigned to ${selectedOfficer}.`
          : `Grievance assigned to ${selectedOfficer}.`,
        'Assignment Recorded'
      );
      onAssignmentSuccess?.(updated);
      onClose();
    } catch (err) {
      console.error(err);
      showError('Failed to record assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isReassign ? 'REASSIGN GRIEVANCE' : 'ASSIGN GRIEVANCE'}
      subtitle={isReassign ? 'Transfer ticket jurisdiction to another officer.' : 'Assign to designated municipal department and officer.'}
      width="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Ticket Header Banner */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '0.78125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="mono" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
              {complaint.complaintId}
            </span>
            <span style={{ fontWeight: 700, color: complaint.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)' }}>
              {complaint.priority} Priority ({complaint.severityScore}/100)
            </span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }}>
            {complaint.title}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            Ward: <strong>{complaint.ward}</strong> &bull; SLA: <strong>{complaint.slaStatus}</strong>
          </div>
        </div>

        {/* Department Selection */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Target Municipal Department *
          </label>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
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
            {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Officer Selection */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Designated Responding Officer *
          </label>
          <select
            value={selectedOfficer}
            onChange={e => setSelectedOfficer(e.target.value)}
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
            {officers.map(off => (
              <option key={off.id} value={`${off.name} (${off.role})`}>
                {off.name} &bull; {off.role} ({off.jurisdiction.split('–')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Mandatory Reason for Reassignment or Note */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isReassign ? 'var(--color-critical)' : 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            {isReassign ? 'Mandatory Reassignment Justification *' : 'Operational Assignment Note (Optional)'}
          </label>
          <textarea
            rows={3}
            placeholder={
              isReassign
                ? 'Explain why this grievance is being reassigned (e.g. Jurisdiction realignment for Ward 12 rapid response)...'
                : 'Instructions for field repair crew or inspection protocols...'
            }
            value={assignmentNote}
            onChange={e => setAssignmentNote(e.target.value)}
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

        {/* Separated Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '16px',
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
            <UserCheck size={15} />
            <span>{isSubmitting ? 'Assigning...' : isReassign ? 'Confirm Reassignment' : 'Confirm Assignment'}</span>
          </button>
        </div>
      </form>
    </Drawer>
  );
}
