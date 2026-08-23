import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MUNICIPAL_CATEGORIES, MUNICIPAL_DEPARTMENTS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { submitOfficerDecision } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OfficerDecisionCard({ complaint, onDecisionSaved }) {
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(complaint?.predictedCategory || complaint?.category || 'Water Supply');
  const [selectedSeverity, setSelectedSeverity] = useState(complaint?.severityScore || 90);
  const [selectedDept, setSelectedDept] = useState(complaint?.recommendedDepartment || complaint?.department || MUNICIPAL_DEPARTMENTS.WATER);
  const [modificationReason, setModificationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officerDecisionHistory, setOfficerDecisionHistory] = useState(null);

  const canReviewAI = hasPermission(PERMISSIONS.REVIEW_AI);
  const canModifyAI = hasPermission(PERMISSIONS.MODIFY_AI_RECOMMENDATION);

  if (!complaint) return null;

  const handleApproveAI = async () => {
    if (!canReviewAI) {
      showWarning(`Your municipal role (${user?.role}) does not have statutory authority to approve AI triage decisions.`, 'Authority Restricted');
      return;
    }

    setIsSubmitting(true);
    try {
      const decision = {
        category: complaint.predictedCategory || complaint.category,
        severityScore: complaint.severityScore,
        department: complaint.recommendedDepartment || complaint.department,
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Zonal Ward Officer',
        reason: 'Officer Approved AI Recommendation without modifications.',
      };

      const updated = await submitOfficerDecision(complaint.complaintId, decision);
      setOfficerDecisionHistory(decision);
      showSuccess('AI triage recommendation approved by officer.', 'Decision Recorded');
      onDecisionSaved?.(updated);
    } catch (err) {
      console.error(err);
      showError('Failed to record officer approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveModification = async e => {
    e.preventDefault();

    if (!canModifyAI) {
      showWarning(`Your municipal role (${user?.role}) does not have statutory authority to modify AI recommendations.`, 'Authority Restricted');
      return;
    }

    if (!modificationReason.trim()) {
      showWarning('Please enter a justification reason for modifying the AI recommendation.', 'Reason Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const decision = {
        category: selectedCategory,
        severityScore: parseInt(selectedSeverity, 10),
        department: selectedDept,
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Zonal Ward Officer',
        reason: modificationReason.trim(),
      };

      const updated = await submitOfficerDecision(complaint.complaintId, decision);
      setOfficerDecisionHistory(decision);
      setMode('view');
      showSuccess('Officer override saved and audit history updated.', 'Decision Overridden');
      onDecisionSaved?.(updated);
    } catch (err) {
      console.error(err);
      showError('Failed to submit officer override.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-primary-light)',
        borderRadius: 'var(--radius-md)',
        padding: '22px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
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
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <ShieldCheck size={13} /> HUMAN-IN-THE-LOOP (HITL) GOVERNANCE
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Officer Decision & Statutory Authority
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            AI assists with probabilistic recommendations &bull; The municipal officer possesses final legal decision authority
          </p>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Active Officer: <strong>{user?.name || 'Rohan Patil'}</strong> ({user?.role || 'Zonal Officer'})
        </div>
      </div>

      {/* Comparison Grid: AI Recommendation vs Officer Decision */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Card: AI Recommendation */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-ai-tint)',
            border: '1px solid var(--color-ai-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-ai)' }}>
            <BrainCircuit size={14} /> AI INFERENCE RECOMMENDATION
          </div>

          <div style={{ fontSize: '0.78125rem', color: 'var(--color-ink)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>Category:</span>{' '}
              <strong>{complaint.predictedCategory || complaint.category}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>Assessed Severity:</span>{' '}
              <strong style={{ color: complaint.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)' }}>
                {complaint.severityScore} / 100 ({complaint.priority})
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>Recommended Dept:</span>{' '}
              <strong>{(complaint.recommendedDepartment || complaint.department).split('&')[0]}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>AI Confidence:</span>{' '}
              <strong style={{ color: 'var(--color-ai)' }}>{complaint.aiConfidence}%</strong>
            </div>
          </div>

          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ai)', fontStyle: 'italic', marginTop: 'auto' }}>
            * Advisory assessment generated from citizen text and spatial factors.
          </div>
        </div>

        {/* Right Card: Officer Decision Panel */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: officerDecisionHistory ? 'var(--color-healthy-bg)' : '#FFFFFF',
            border: officerDecisionHistory ? '1px solid var(--color-healthy-border)' : '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              <ShieldCheck size={14} /> OFFICER STATUTORY DECISION
            </div>
            {officerDecisionHistory && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-healthy)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> Recorded
              </span>
            )}
          </div>

          {mode === 'view' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
              {officerDecisionHistory ? (
                <div style={{ fontSize: '0.78125rem', color: 'var(--color-ink)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>Category:</span>{' '}
                    <strong>{officerDecisionHistory.category}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>Severity:</span>{' '}
                    <strong>{officerDecisionHistory.severityScore} / 100</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>Department:</span>{' '}
                    <strong>{officerDecisionHistory.department.split('&')[0]}</strong>
                  </div>
                  <div style={{ padding: '6px 8px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-healthy-border)', fontSize: '0.72rem' }}>
                    <strong>Officer Justification:</strong> {officerDecisionHistory.reason}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', margin: 0 }}>
                  Review the AI triage indicators and choose to approve the recommendation or adjust the category, severity, or department assignment based on field knowledge.
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleApproveAI}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-healthy)',
                    color: '#FFFFFF',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <CheckCircle2 size={13} /> Approve AI Triage
                </button>

                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    border: '1px solid var(--color-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Edit3 size={13} /> Modify Recommendation
                </button>
              </div>
            </div>
          ) : (
            /* Edit / Override Form */
            <form onSubmit={handleSaveModification} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '2px' }}>
                    Category Override
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}
                  >
                    {MUNICIPAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '2px' }}>
                    Severity Score ({selectedSeverity}/100)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={selectedSeverity}
                    onChange={e => setSelectedSeverity(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '2px' }}>
                  Department Re-assignment
                </label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}
                >
                  {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-critical)', display: 'block', marginBottom: '2px' }}>
                  Mandatory Officer Justification *
                </label>
                <input
                  type="text"
                  placeholder="State reason for overriding AI recommendation (e.g. Field inspection reveals lower urgency)..."
                  value={modificationReason}
                  onChange={e => setModificationReason(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={12} /> Save Officer Decision
                </button>

                <button
                  type="button"
                  onClick={() => setMode('view')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--color-surface-sunken)',
                    color: 'var(--color-ink)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
