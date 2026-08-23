import React, { useState } from 'react';
import { FileCheck, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { submitResolution } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ResolutionPanel({
  isOpen,
  onClose,
  complaint,
  onResolutionSuccess,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const [resolutionType, setResolutionType] = useState('Permanent Resolution');
  const [summary, setSummary] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [affectedArea, setAffectedArea] = useState(complaint?.location || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline validation errors state
  const [errors, setErrors] = useState({});

  if (!complaint) return null;

  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = {};
    if (!summary.trim()) {
      newErrors.summary = 'Resolution summary is required for citizen notification.';
    }
    if (!actionsTaken.trim()) {
      newErrors.actionsTaken = 'Please detail specific technical/engineering actions taken.';
    }
    if (!isConfirmed) {
      newErrors.isConfirmed = 'Statutory officer declaration checkbox must be confirmed.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Please complete all required resolution fields.', 'Validation Incomplete');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const updated = await submitResolution(complaint.complaintId, {
        resolutionType,
        summary: summary.trim(),
        actionsTaken: actionsTaken.trim(),
        affectedArea: affectedArea.trim(),
        citizenNotified: true,
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess('Resolution submitted successfully. Grievance marked as Resolved.', 'Resolution Recorded');
      onResolutionSuccess?.(updated);
      onClose();
    } catch (err) {
      console.error(err);
      showError('Failed to record resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="RESOLUTION & CLOSURE"
      subtitle="Submit verified field resolution and statutory closure confirmation."
      width="560px"
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: '10px',
        }}
      >
        {/* Compact Context Card */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '0.78125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span className="mono" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
              {complaint.complaintId}
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-tint)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              Status: {complaint.status}
            </span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }}>
            {complaint.title}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            Ward: <strong>{complaint.ward}</strong> &bull; Dept: <strong>{complaint.department.split('&')[0]}</strong>
          </div>
        </div>

        {/* 1. Resolution Type */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Resolution Scope & Nature *
          </label>
          <select
            value={resolutionType}
            onChange={e => setResolutionType(e.target.value)}
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
            <option value="Permanent Resolution">Permanent Engineering Resolution</option>
            <option value="Temporary Mitigation">Temporary Hazard Mitigation (Permanent work queued)</option>
            <option value="Partial Resolution">Partial Zonal Restoration</option>
          </select>
        </div>

        {/* 2. Resolution Summary */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Resolution Summary (Citizen-Facing) *
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Main 600mm distribution feeder valve replaced, water pressure restored to 2.4 bar, and trench backfilled."
            value={summary}
            onChange={e => {
              setSummary(e.target.value);
              if (errors.summary) setErrors(prev => ({ ...prev, summary: null }));
            }}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: errors.summary ? '1px solid var(--color-critical)' : '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
              resize: 'vertical',
            }}
          />
          {errors.summary && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-critical)', fontWeight: 600, marginTop: '3px' }}>
              {errors.summary}
            </div>
          )}
        </div>

        {/* 3. Technical Actions Taken */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Technical Actions Taken & Crew Protocols *
          </label>
          <textarea
            rows={3}
            placeholder="e.g. 1. Excavated chamber; 2. Installed ductile iron collar; 3. Hydraulic pressure test verified; 4. Bacteriological water sample collected."
            value={actionsTaken}
            onChange={e => {
              setActionsTaken(e.target.value);
              if (errors.actionsTaken) setErrors(prev => ({ ...prev, actionsTaken: null }));
            }}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: errors.actionsTaken ? '1px solid var(--color-critical)' : '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
              resize: 'vertical',
            }}
          />
          {errors.actionsTaken && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-critical)', fontWeight: 600, marginTop: '3px' }}>
              {errors.actionsTaken}
            </div>
          )}
        </div>

        {/* 4. Rectified Area */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>
            Rectified Area Coverage (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Sector 4 & Sector 5, Hadapsar"
            value={affectedArea}
            onChange={e => setAffectedArea(e.target.value)}
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

        {/* 5. Statutory Confirmation Callout (Subtle Navy/Slate Callout, NOT Bright Green) */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: errors.isConfirmed ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <input
            type="checkbox"
            id="resolution-confirm-check"
            checked={isConfirmed}
            onChange={e => {
              setIsConfirmed(e.target.checked);
              if (errors.isConfirmed) setErrors(prev => ({ ...prev, isConfirmed: null }));
            }}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--color-primary)',
              marginTop: '2px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <label
            htmlFor="resolution-confirm-check"
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-ink)',
              lineHeight: 1.45,
              cursor: 'pointer',
            }}
          >
            <strong>Statutory Officer Confirmation:</strong> I officially confirm that the reported municipal grievance has been inspected and rectified to the engineering standards specified above.
          </label>
        </div>
        {errors.isConfirmed && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-critical)', fontWeight: 600, marginTop: '-8px' }}>
            {errors.isConfirmed}
          </div>
        )}

        {/* Separated Sticky Footer Actions */}
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
              padding: '0 20px',
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
            <FileCheck size={16} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Resolution'}</span>
          </button>
        </div>
      </form>
    </Drawer>
  );
}
