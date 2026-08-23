import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  User,
  Building2,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import PriorityBadge from '../complaints/PriorityBadge';
import StatusBadge from '../complaints/StatusBadge';
import EscalationPanel from '../officer/EscalationPanel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function SLAPriorityQueue({
  complaints = [],
  onComplaintUpdated,
}) {
  const navigate = useNavigate();
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const { showWarning } = useToast();
  const [escalatingComplaint, setEscalatingComplaint] = useState(null);

  const canEscalate = hasPermission(PERMISSIONS.ESCALATE_COMPLAINT);

  // Sort by Urgency:
  // 1. Breached
  // 2. At Risk with lowest remaining hours
  // 3. High severity
  // 4. Remaining
  const sortedQueue = [...complaints].sort((a, b) => {
    if (a.slaStatus === 'BREACHED' && b.slaStatus !== 'BREACHED') return -1;
    if (a.slaStatus !== 'BREACHED' && b.slaStatus === 'BREACHED') return 1;

    if (a.slaStatus === 'AT RISK' && b.slaStatus !== 'AT RISK') return -1;
    if (a.slaStatus !== 'AT RISK' && b.slaStatus === 'AT RISK') return 1;

    const aRem = a.slaRemainingHours ?? 999;
    const bRem = b.slaRemainingHours ?? 999;
    if (aRem !== bRem) return aRem - bRem;

    return (b.severityScore || 0) - (a.severityScore || 0);
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color="var(--color-critical)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Immediate SLA Attention & Priority Triage Queue
          </h3>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-critical-bg)',
              color: 'var(--color-critical)',
              fontSize: '0.6875rem',
              fontWeight: 800,
            }}
          >
            {sortedQueue.length} Active
          </span>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Ordered strictly by deadline breach urgency
        </span>
      </div>

      {/* Queue List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '540px', overflowY: 'auto', paddingRight: '4px' }}>
        {sortedQueue.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: '0.8125rem' }}>
            No active grievances match your SLA filter criteria.
          </div>
        ) : (
          sortedQueue.map(c => {
            const isBreached = c.slaStatus === 'BREACHED';
            const isAtRisk = c.slaStatus === 'AT RISK';
            const escLevel = c.escalationLevel || 1;

            return (
              <div
                key={c.complaintId}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: isBreached
                    ? '1px solid var(--color-critical-border)'
                    : isAtRisk
                    ? '1px solid var(--color-high-border)'
                    : '1px solid var(--color-border)',
                  backgroundColor: isBreached
                    ? 'rgba(220, 38, 38, 0.03)'
                    : isAtRisk
                    ? 'rgba(234, 88, 12, 0.02)'
                    : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  transition: 'all 0.12s ease',
                }}
                className="hover-shadow-sm"
              >
                {/* Left: Metadata & Title */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className="mono" style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {c.complaintId}
                    </span>
                    <PriorityBadge priority={c.priority} severityScore={c.severityScore} />

                    {/* SLA Badge */}
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: isBreached
                          ? 'var(--color-critical-bg)'
                          : isAtRisk
                          ? 'var(--color-high-bg)'
                          : 'var(--color-healthy-bg)',
                        color: isBreached
                          ? 'var(--color-critical)'
                          : isAtRisk
                          ? 'var(--color-high)'
                          : 'var(--color-healthy)',
                        border: isBreached
                          ? '1px solid var(--color-critical-border)'
                          : isAtRisk
                          ? '1px solid var(--color-high-border)'
                          : '1px solid var(--color-healthy-border)',
                      }}
                    >
                      {c.slaStatus || 'ON TRACK'} &bull;{' '}
                      {c.slaRemainingHours !== undefined && c.slaRemainingHours > 0
                        ? `${c.slaRemainingHours}h remaining`
                        : 'Breached'}
                    </span>

                    {/* Escalation Badge */}
                    {escLevel > 1 && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-ai-tint)',
                          color: 'var(--color-ai)',
                          border: '1px solid var(--color-ai-border)',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        Escalated Tier: Level {escLevel}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.35 }}>
                    {c.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--color-ink-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} color="var(--color-ink-faint)" />
                      {c.department.split('&')[0]}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--color-ink-faint)" />
                      {c.ward}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} color="var(--color-ink-faint)" />
                      {c.assignedOfficer || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/complaints/${c.complaintId}`)}
                    style={{
                      height: '36px',
                      padding: '0 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Review Ticket</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!canEscalate) {
                        showWarning(`Your municipal role (${user?.role}) does not have statutory authority to escalate complaints.`, 'Authority Restricted');
                        return;
                      }
                      setEscalatingComplaint(c);
                    }}
                    style={{
                      height: '36px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-critical-bg)',
                      color: 'var(--color-critical)',
                      border: '1px solid var(--color-critical-border)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      opacity: canEscalate ? 1 : 0.65,
                    }}
                    title={canEscalate ? undefined : 'Requires Escalation statutory authority'}
                  >
                    <ArrowUpRight size={13} />
                    <span>Escalate</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Escalation Modal using existing Stage 5 EscalationPanel */}
      <EscalationPanel
        isOpen={Boolean(escalatingComplaint)}
        onClose={() => setEscalatingComplaint(null)}
        complaint={escalatingComplaint}
        onEscalationSuccess={updated => {
          onComplaintUpdated?.(updated);
          setEscalatingComplaint(null);
        }}
      />
    </div>
  );
}
