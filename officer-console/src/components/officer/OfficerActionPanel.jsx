import React, { useState } from 'react';
import {
  UserCheck,
  ClipboardList,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Building2,
  User,
  Clock,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import AssignmentPanel from './AssignmentPanel';
import ActionLogForm from './ActionLogForm';
import EvidenceUpload from './EvidenceUpload';
import ResolutionPanel from './ResolutionPanel';
import EscalationPanel from './EscalationPanel';
import ReopenPanel from './ReopenPanel';
import StatusBadge from '../complaints/StatusBadge';
import { updateComplaintStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function OfficerActionPanel({
  complaint,
  onComplaintUpdated,
}) {
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'action_log' | 'evidence' | 'resolve' | 'escalate' | 'reopen'
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!complaint) return null;

  const isReassign = Boolean(complaint.assignedOfficer && complaint.assignedOfficer !== 'UNASSIGNED');
  const isResolvedOrConfirmed = complaint.status === 'Resolved' || complaint.status === 'Citizen Confirmed';

  // Statutory Permission Checks
  const canAssign = isReassign
    ? hasPermission(PERMISSIONS.REASSIGN_COMPLAINT)
    : hasPermission(PERMISSIONS.ASSIGN_COMPLAINT);
  const canPerformAction = hasPermission(PERMISSIONS.PERFORM_OPERATIONAL_ACTION);
  const canUploadEvidence = hasPermission(PERMISSIONS.UPLOAD_EVIDENCE);
  const canResolve = hasPermission(PERMISSIONS.RESOLVE_COMPLAINT);
  const canEscalate = hasPermission(PERMISSIONS.ESCALATE_COMPLAINT);
  const canReopen = hasPermission(PERMISSIONS.REOPEN_COMPLAINT);

  const handleStartWork = async () => {
    if (!canPerformAction) {
      showWarning(`Your municipal role (${user?.role}) does not have statutory authority to transition grievance status.`, 'Authority Restricted');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(complaint.complaintId, {
        status: 'In Progress',
        reason: 'Officer initiated field engineering and inspection operations.',
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });
      showSuccess('Grievance status moved to IN PROGRESS.', 'Work Commenced');
      onComplaintUpdated?.(updated);
    } catch (err) {
      console.error(err);
      showError('Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenModal = (modalKey, isAuthorized, actionLabel) => {
    if (!isAuthorized) {
      showWarning(
        `Your municipal role (${user?.role}) does not have statutory authority to ${actionLabel}.`,
        'Statutory Restriction'
      );
      return;
    }
    setActiveModal(modalKey);
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
      {/* Header & Meta Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              <Building2 size={12} /> MUNICIPAL OPERATIONS & ACTION CENTER
            </span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Officer Lifecycle Actions & Field Management
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>Current Status:</span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Meta Operational Details Row (4 Balanced Equal Width Grid Items) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          padding: '12px 14px',
          backgroundColor: 'var(--color-surface-sunken)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '0.75rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Assigned Department
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {(complaint.department || '').split('&')[0]}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Assigned Officer
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {complaint.assignedOfficer || 'Unassigned'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            SLA Resolution State
          </div>
          <div style={{ fontWeight: 700, color: complaint.slaStatus === 'BREACHED' ? 'var(--color-critical)' : complaint.slaStatus === 'AT RISK' ? 'var(--color-high)' : 'var(--color-healthy)', marginTop: '2px' }}>
            {complaint.slaStatus} {complaint.slaRemainingHours > 0 ? `(${complaint.slaRemainingHours}h left)` : '(Overdue)'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Escalation Level
          </div>
          <div style={{ fontWeight: 700, color: complaint.escalationLevel > 1 ? 'var(--color-critical)' : 'var(--color-ink)', marginTop: '2px' }}>
            Level {complaint.escalationLevel || 1} {complaint.escalationLevel > 1 ? '(Escalated)' : '(Standard)'}
          </div>
        </div>
      </div>

      {/* Primary Operational Actions Toolbar (Consistent 42px Height, Design Tokens) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          paddingTop: '4px',
        }}
      >
        {/* 1. Assign / Reassign */}
        <button
          type="button"
          onClick={() => handleOpenModal('assign', canAssign, isReassign ? 'reassign complaints' : 'assign complaints')}
          style={{
            height: '42px',
            padding: '0 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            color: canAssign ? 'var(--color-primary)' : 'var(--color-ink-muted)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)',
            opacity: canAssign ? 1 : 0.65,
            transition: 'all 0.12s ease',
          }}
          className="hover-shadow-sm"
          title={canAssign ? undefined : 'Requires Assignment statutory authority'}
        >
          <UserCheck size={16} color={canAssign ? 'var(--color-primary)' : 'var(--color-ink-muted)'} />
          <span>{complaint.assignedOfficer && complaint.assignedOfficer !== 'UNASSIGNED' ? 'Reassign Officer' : 'Assign Complaint'}</span>
        </button>

        {/* 2. Begin Work (if in Assigned state) */}
        {complaint.status === 'Assigned' && (
          <button
            type="button"
            onClick={handleStartWork}
            disabled={isUpdatingStatus}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-light)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-xs)',
              opacity: canPerformAction ? 1 : 0.65,
            }}
          >
            <Play size={15} />
            <span>{isUpdatingStatus ? 'Updating...' : 'Begin Work (In Progress)'}</span>
          </button>
        )}

        {/* 3. Record Operational Action */}
        <button
          type="button"
          onClick={() => handleOpenModal('action_log', canPerformAction, 'record operational actions')}
          style={{
            height: '42px',
            padding: '0 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            color: canPerformAction ? 'var(--color-primary)' : 'var(--color-ink-muted)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)',
            opacity: canPerformAction ? 1 : 0.65,
            transition: 'all 0.12s ease',
          }}
          className="hover-shadow-sm"
          title={canPerformAction ? undefined : 'Requires Operational Action statutory authority'}
        >
          <ClipboardList size={16} color={canPerformAction ? 'var(--color-primary)' : 'var(--color-ink-muted)'} />
          <span>Record Operational Action</span>
        </button>

        {/* 4. Attach Evidence */}
        <button
          type="button"
          onClick={() => handleOpenModal('evidence', canUploadEvidence, 'upload remediation evidence')}
          style={{
            height: '42px',
            padding: '0 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            color: canUploadEvidence ? 'var(--color-primary)' : 'var(--color-ink-muted)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)',
            opacity: canUploadEvidence ? 1 : 0.65,
            transition: 'all 0.12s ease',
          }}
          className="hover-shadow-sm"
          title={canUploadEvidence ? undefined : 'Requires Evidence Upload statutory authority'}
        >
          <Upload size={16} color={canUploadEvidence ? 'var(--color-primary)' : 'var(--color-ink-muted)'} />
          <span>Attach Resolution Evidence</span>
        </button>

        {/* 5. Submit Final Resolution */}
        {!isResolvedOrConfirmed && (
          <button
            type="button"
            onClick={() => handleOpenModal('resolve', canResolve, 'submit final grievance resolution')}
            style={{
              height: '42px',
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
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              opacity: canResolve ? 1 : 0.65,
            }}
            title={canResolve ? undefined : 'Requires Resolution statutory authority'}
          >
            <FileCheck size={16} />
            <span>Submit Final Resolution</span>
          </button>
        )}

        {/* 6. Escalate Ticket */}
        {!isResolvedOrConfirmed && (
          <button
            type="button"
            onClick={() => handleOpenModal('escalate', canEscalate, 'escalate complaints')}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-critical-bg)',
              color: 'var(--color-critical)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: '1px solid var(--color-critical-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              opacity: canEscalate ? 1 : 0.65,
            }}
            title={canEscalate ? undefined : 'Requires Escalation statutory authority'}
          >
            <AlertTriangle size={15} />
            <span>Escalate Ticket</span>
          </button>
        )}

        {/* 7. Reopen Grievance */}
        {isResolvedOrConfirmed && (
          <button
            type="button"
            onClick={() => handleOpenModal('reopen', canReopen, 'reopen closed grievances')}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-critical)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: '1px solid var(--color-critical-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              opacity: canReopen ? 1 : 0.65,
            }}
            title={canReopen ? undefined : 'Requires Reopen statutory authority'}
          >
            <RotateCcw size={15} />
            <span>Reopen Grievance</span>
          </button>
        )}
      </div>

      {/* Modals & Drawers */}
      <AssignmentPanel
        isOpen={activeModal === 'assign'}
        onClose={() => setActiveModal(null)}
        complaint={complaint}
        onAssignmentSuccess={onComplaintUpdated}
      />

      <ActionLogForm
        isOpen={activeModal === 'action_log'}
        onClose={() => setActiveModal(null)}
        complaint={complaint}
        onActionRecorded={onComplaintUpdated}
      />

      <EvidenceUpload
        isOpen={activeModal === 'evidence'}
        onClose={() => setActiveModal(null)}
        complaint={complaint}
        onEvidenceAdded={onComplaintUpdated}
      />

      <ResolutionPanel
        isOpen={activeModal === 'resolve'}
        onClose={() => setActiveModal(null)}
        complaint={complaint}
        onResolutionSuccess={onComplaintUpdated}
      />

      <EscalationPanel
        isOpen={activeModal === 'escalate'}
        onClose={() => setActiveModal(null)}
        complaint={complaint}
        onEscalationSuccess={onComplaintUpdated}
      />

      <ReopenPanel
        isOpen={activeModal === 'reopen'}
        onClose={() => setActiveModal(null)}
        complaint={complaint}
        onReopenSuccess={onComplaintUpdated}
      />
    </div>
  );
}
