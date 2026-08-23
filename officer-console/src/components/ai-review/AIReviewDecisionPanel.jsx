import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  Save,
  X,
  Sparkles,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { MUNICIPAL_CATEGORIES, MUNICIPAL_DEPARTMENTS } from '../../data/mockData';
import { submitAIReviewDecision } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';

export default function AIReviewDecisionPanel({
  complaint,
  onDecisionSaved,
}) {
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const [mode, setMode] = useState('view'); // 'view' | 'modify' | 'verify' | 'approve_confirm'

  // Statutory Permission Checks
  const canReviewAI = hasPermission(PERMISSIONS.REVIEW_AI);
  const canModifyAI = hasPermission(PERMISSIONS.MODIFY_AI_RECOMMENDATION);

  // Modification Form state
  const [selectedCategory, setSelectedCategory] = useState(complaint?.predictedCategory || complaint?.category || '');
  const [selectedDept, setSelectedDept] = useState(complaint?.recommendedDepartment || complaint?.department || '');
  const [severityScore, setSeverityScore] = useState(complaint?.severityScore || 50);
  const [justification, setJustification] = useState('');
  const [verifyReason, setVerifyReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (complaint) {
      setSelectedCategory(complaint.predictedCategory || complaint.category);
      setSelectedDept(complaint.recommendedDepartment || complaint.department);
      setSeverityScore(complaint.severityScore);
      setJustification('');
      setVerifyReason('');
      setMode('view');
      setErrors({});
    }
  }, [complaint]);

  if (!complaint) return null;

  const currentReviewState = complaint.aiReviewState || 'PENDING REVIEW';

  // 1. Handle Approve Flow
  const handleConfirmApproval = async () => {
    if (!canReviewAI) {
      showWarning(`Your municipal role (${user?.role}) does not have statutory authority to approve AI triage recommendations.`, 'Authority Restricted');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await submitAIReviewDecision(complaint.complaintId, {
        reviewAction: 'APPROVED',
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess('AI triage recommendation officially approved and recorded.', 'Triage Approved');
      onDecisionSaved?.(updated);
      setMode('view');
    } catch (err) {
      console.error(err);
      showError('Failed to approve AI recommendation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Modify Flow
  const handleSaveModification = async e => {
    e.preventDefault();

    if (!canModifyAI) {
      showWarning(`Your municipal role (${user?.role}) does not have statutory authority to modify AI recommendations.`, 'Authority Restricted');
      return;
    }

    if (!justification.trim()) {
      setErrors({ justification: 'Officer justification is required when modifying an AI recommendation.' });
      showWarning('Officer justification is required.', 'Justification Missing');
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const updated = await submitAIReviewDecision(complaint.complaintId, {
        reviewAction: 'MODIFIED',
        category: selectedCategory,
        department: selectedDept,
        severityScore: parseInt(severityScore, 10),
        reason: justification.trim(),
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess('AI recommendation modified and statutory triage saved.', 'Modification Recorded');
      onDecisionSaved?.(updated);
      setMode('view');
    } catch (err) {
      console.error(err);
      showError('Failed to save modification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Send for Human Verification Flow
  const handleConfirmHumanVerification = async e => {
    e.preventDefault();

    if (!canReviewAI) {
      showWarning(`Your municipal role (${user?.role}) does not have statutory authority to flag triage recommendations.`, 'Authority Restricted');
      return;
    }

    if (!verifyReason.trim()) {
      setErrors({ verifyReason: 'Verification reason is required to flag for field inspection.' });
      showWarning('Please enter a verification reason.', 'Reason Required');
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const updated = await submitAIReviewDecision(complaint.complaintId, {
        reviewAction: 'HUMAN_VERIFICATION_REQUIRED',
        reason: verifyReason.trim(),
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess('Grievance marked for on-ground human verification.', 'Flagged for Verification');
      onDecisionSaved?.(updated);
      setMode('view');
    } catch (err) {
      console.error(err);
      showError('Failed to flag for verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header with clear Advisory vs Statutory distinction */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <ShieldCheck size={13} /> OFFICER STATUTORY DECISION CENTER
            </span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Human-in-the-Loop Triage Decision
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>Review State:</span>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              backgroundColor:
                currentReviewState === 'APPROVED'
                  ? 'var(--color-healthy-bg)'
                  : currentReviewState === 'MODIFIED'
                  ? 'var(--color-high-bg)'
                  : currentReviewState === 'HUMAN VERIFICATION REQUIRED'
                  ? 'var(--color-critical-bg)'
                  : 'var(--color-primary-tint)',
              color:
                currentReviewState === 'APPROVED'
                  ? 'var(--color-healthy)'
                  : currentReviewState === 'MODIFIED'
                  ? 'var(--color-high)'
                  : currentReviewState === 'HUMAN VERIFICATION REQUIRED'
                  ? 'var(--color-critical)'
                  : 'var(--color-primary)',
              border:
                currentReviewState === 'APPROVED'
                  ? '1px solid var(--color-healthy-border)'
                  : currentReviewState === 'MODIFIED'
                  ? '1px solid var(--color-high-border)'
                  : currentReviewState === 'HUMAN VERIFICATION REQUIRED'
                  ? '1px solid var(--color-critical-border)'
                  : '1px solid var(--color-border)',
            }}
          >
            {currentReviewState}
          </span>
        </div>
      </div>

      {/* Advisory vs Authority Contrast Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          padding: '12px 14px',
          backgroundColor: 'var(--color-surface-sunken)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ai)', textTransform: 'uppercase' }}>
            AI Recommendation (Advisory Only)
          </span>
          <div style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
            {complaint.predictedCategory || complaint.category} &bull; {complaint.recommendedDepartment || complaint.department} &bull; Score: {complaint.severityScore}/100
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
            Confidence: {complaint.aiConfidence}% &bull; Authenticity: {complaint.authenticityScore || 98}%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
            Authorized Reviewing Officer
          </span>
          <div style={{ color: 'var(--color-ink)', fontWeight: 700 }}>
            {user?.name || 'Rohan Patil'} ({user?.role || 'Municipal Officer'})
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
            Statutory Jurisdiction: Pune Municipal Corporation
          </div>
        </div>
      </div>

      {/* 1. Main Action Buttons in 'view' mode */}
      {mode === 'view' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            paddingTop: '4px',
          }}
        >
          {/* Approve Button */}
          <button
            type="button"
            onClick={() => {
              if (!canReviewAI) {
                showWarning(`Your municipal role (${user?.role}) does not have statutory authority to approve AI triage decisions.`, 'Authority Restricted');
                return;
              }
              setMode('approve_confirm');
            }}
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
              opacity: canReviewAI ? 1 : 0.65,
            }}
            title={canReviewAI ? undefined : 'Requires AI Review statutory authority'}
          >
            <CheckCircle2 size={16} />
            <span>Approve AI Recommendation</span>
          </button>

          {/* Modify Button */}
          <button
            type="button"
            onClick={() => {
              if (!canModifyAI) {
                showWarning(`Your municipal role (${user?.role}) does not have statutory authority to modify AI recommendations.`, 'Authority Restricted');
                return;
              }
              setMode('modify');
            }}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFFFFF',
              color: canModifyAI ? 'var(--color-primary)' : 'var(--color-ink-muted)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              opacity: canModifyAI ? 1 : 0.65,
            }}
            className="hover-shadow-sm"
            title={canModifyAI ? undefined : 'Requires AI Modification statutory authority'}
          >
            <Edit3 size={15} color={canModifyAI ? 'var(--color-primary)' : 'var(--color-ink-muted)'} />
            <span>Modify Recommendation</span>
          </button>

          {/* Send for Verification Button */}
          <button
            type="button"
            onClick={() => {
              if (!canReviewAI) {
                showWarning(`Your municipal role (${user?.role}) does not have statutory authority to flag triage recommendations.`, 'Authority Restricted');
                return;
              }
              setMode('verify');
            }}
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
              opacity: canReviewAI ? 1 : 0.65,
            }}
            title={canReviewAI ? undefined : 'Requires AI Review statutory authority'}
          >
            <AlertTriangle size={15} />
            <span>Send for Human Verification</span>
          </button>
        </div>
      )}

      {/* 2. Inline Modify Form */}
      {mode === 'modify' && (
        <form
          onSubmit={handleSaveModification}
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-ink)' }}>
              Modify AI Classification & Routing Parameters
            </div>
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: '#FFFFFF' }}
              >
                {Object.values(MUNICIPAL_CATEGORIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
                Department
              </label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: '#FFFFFF' }}
              >
                {Object.values(MUNICIPAL_DEPARTMENTS).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
                Severity ({severityScore}/100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={severityScore}
                onChange={e => setSeverityScore(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--color-primary)', marginTop: '8px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-critical)', display: 'block', marginBottom: '4px' }}>
              Mandatory Officer Justification *
            </label>
            <textarea
              rows={2}
              placeholder="Explain rationale for overriding AI triage (e.g. Field inspection confirmed water leak affects traffic corridor)..."
              value={justification}
              onChange={e => {
                setJustification(e.target.value);
                if (errors.justification) setErrors(prev => ({ ...prev, justification: null }));
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-xs)',
                border: errors.justification ? '1px solid var(--color-critical)' : '1px solid var(--color-border)',
                fontSize: '0.78125rem',
                backgroundColor: '#FFFFFF',
                resize: 'vertical',
              }}
            />
            {errors.justification && (
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-critical)', fontWeight: 600, marginTop: '3px' }}>
                {errors.justification}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{ height: '36px', padding: '0 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ height: '36px', padding: '0 18px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: 'var(--text-xs)', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              <Save size={13} />
              <span>{isSubmitting ? 'Saving...' : 'Save Officer Override'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Inline Send for Verification Form */}
      {mode === 'verify' && (
        <form
          onSubmit={handleConfirmHumanVerification}
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-critical-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-critical-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-critical)' }}>
              Flag AI Triage for On-Ground Verification
            </div>
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-critical)' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.4 }}>
            This rejects the simulated AI recommendation and requires physical field inspection before statutory assignment. <em>Note: This does NOT reject the citizen grievance.</em>
          </p>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-critical)', display: 'block', marginBottom: '4px' }}>
              Verification Reason *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Low AI confidence score (64%) and photographic ambiguity requires field supervisor confirmation..."
              value={verifyReason}
              onChange={e => {
                setVerifyReason(e.target.value);
                if (errors.verifyReason) setErrors(prev => ({ ...prev, verifyReason: null }));
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-xs)',
                border: errors.verifyReason ? '1px solid var(--color-critical)' : '1px solid var(--color-border)',
                fontSize: '0.78125rem',
                backgroundColor: '#FFFFFF',
                resize: 'vertical',
              }}
            />
            {errors.verifyReason && (
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-critical)', fontWeight: 600, marginTop: '3px' }}>
                {errors.verifyReason}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{ height: '36px', padding: '0 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ height: '36px', padding: '0 18px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--color-critical)', color: '#FFFFFF', fontSize: 'var(--text-xs)', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              <AlertTriangle size={13} />
              <span>{isSubmitting ? 'Flagging...' : 'Confirm Verification Flag'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal for Approve Flow */}
      <Modal
        isOpen={mode === 'approve_confirm'}
        onClose={() => setMode('view')}
        title="Approve AI Triage Recommendation"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink)', lineHeight: 1.5, margin: 0 }}>
            Accept AI recommendation for <strong>{complaint.complaintId}</strong>?
          </p>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              fontSize: '0.75rem',
            }}
          >
            <div>Category: <strong>{complaint.predictedCategory || complaint.category}</strong></div>
            <div>Department: <strong>{complaint.recommendedDepartment || complaint.department}</strong></div>
            <div>Severity Score: <strong>{complaint.severityScore}/100 ({complaint.priority})</strong></div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
            This statutory approval will transition the review state to <strong>APPROVED</strong> and record your officer signature in the audit history ledger.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{ height: '38px', padding: '0 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmApproval}
              disabled={isSubmitting}
              style={{ height: '38px', padding: '0 18px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: 'var(--text-xs)', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              <CheckCircle2 size={14} />
              <span>{isSubmitting ? 'Approving...' : 'Confirm Approval'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
