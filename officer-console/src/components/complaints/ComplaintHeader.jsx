import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { useToast } from '../../context/ToastContext';

const STEPPER_STAGES = [
  'Submitted',
  'AI Classified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Citizen Confirmed',
];

export default function ComplaintHeader({ complaint, onQuickAction }) {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.complaintId);
    setCopied(true);
    showSuccess(`Copied ID ${complaint.complaintId} to clipboard.`, 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStageIndex = status => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'AI Classified':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
      case 'Escalated':
      case 'Reopened':
        return 3;
      case 'Resolved':
        return 4;
      case 'Citizen Confirmed':
        return 5;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(complaint.status);

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
        gap: '14px',
      }}
    >
      {/* Top Bar: Back Link & Quick Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => navigate('/complaints')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-primary-tint)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={13} /> Back to Grievance Registry
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink-muted)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              border: '1px solid var(--color-border)',
            }}
          >
            Investigation & Operations Console
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-ai-tint)',
              color: 'var(--color-ai)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} /> AI Assisted
          </span>
        </div>
      </div>

      {/* Main Title & Identifier Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {complaint.complaintId}
              </span>
              <button
                onClick={handleCopyId}
                title="Copy Complaint ID"
                style={{
                  padding: '3px 6px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-sunken)',
                  color: 'var(--color-ink-muted)',
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={12} color="var(--color-healthy)" /> : <Copy size={12} />}
              </button>
            </div>

            <PriorityBadge priority={complaint.priority} severityScore={complaint.severityScore} />
            <StatusBadge status={complaint.status} />

            {complaint.slaStatus && (
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  backgroundColor:
                    complaint.slaStatus === 'BREACHED'
                      ? 'var(--color-critical-bg)'
                      : complaint.slaStatus === 'AT RISK'
                      ? 'var(--color-high-bg)'
                      : 'var(--color-healthy-bg)',
                  color:
                    complaint.slaStatus === 'BREACHED'
                      ? 'var(--color-critical)'
                      : complaint.slaStatus === 'AT RISK'
                      ? 'var(--color-high)'
                      : 'var(--color-healthy)',
                  border:
                    complaint.slaStatus === 'BREACHED'
                      ? '1px solid var(--color-critical-border)'
                      : complaint.slaStatus === 'AT RISK'
                      ? '1px solid var(--color-high-border)'
                      : '1px solid var(--color-healthy-border)',
                }}
              >
                SLA: {complaint.slaStatus}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.35, margin: 0 }}>
            {complaint.title}
          </h1>
        </div>

        {/* Action Anchor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => onQuickAction?.('review')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <ShieldCheck size={14} /> Operations & Actions &darr;
          </button>
        </div>
      </div>

      {/* Compact Status Stepper Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
          overflowX: 'auto',
          fontSize: '0.6875rem',
        }}
      >
        <span style={{ fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
          Lifecycle:
        </span>
        {STEPPER_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          return (
            <React.Fragment key={stage}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                  color: isCurrent
                    ? 'var(--color-primary)'
                    : isDone
                    ? 'var(--color-healthy)'
                    : 'var(--color-ink-faint)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{isDone ? '✓' : isCurrent ? '●' : '○'}</span>
                <span>{stage}</span>
              </span>
              {idx < STEPPER_STAGES.length - 1 && (
                <span style={{ color: 'var(--color-border-strong)' }}>&rarr;</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Metadata Bottom Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--color-ink-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MapPin size={13} color="var(--color-ink-faint)" />
          <span>
            <strong>{complaint.ward}</strong> &bull; {complaint.location}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Building2 size={13} color="var(--color-ink-faint)" />
          <span>{complaint.department}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <User size={13} color="var(--color-ink-faint)" />
          <span>
            Assigned: <strong>{complaint.assignedOfficer || 'Unassigned'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={13} color="var(--color-ink-faint)" />
          <span>
            Submitted: {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
            {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
