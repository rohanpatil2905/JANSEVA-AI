import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import Drawer from '../ui/Drawer';

export default function AuditEventDrawer({
  isOpen,
  onClose,
  event,
}) {
  const navigate = useNavigate();

  if (!event) return null;

  const isAI = event.actorType === 'AI Engine';
  const isOfficer = event.actorType === 'Officer';
  const isCitizen = event.actorType === 'Citizen';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="AUDIT EVENT RECORD"
      subtitle={event.eventId}
      width="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Authority Banner */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isAI
              ? 'var(--color-ai-tint)'
              : isOfficer
              ? 'var(--color-primary-tint)'
              : 'var(--color-surface-sunken)',
            border: isAI
              ? '1px solid var(--color-ai-border)'
              : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAI ? (
              <Sparkles size={16} color="var(--color-ai)" />
            ) : (
              <ShieldCheck size={16} color="var(--color-primary)" />
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAI ? 'var(--color-ai)' : 'var(--color-primary)' }}>
              {event.authorityBadge}
            </span>
          </div>

          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
            {new Date(event.timestamp).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Complaint Association Card */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-sunken)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Associated Grievance
            </div>
            <div className="mono" style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
              {event.complaintId}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--color-ink)', fontWeight: 600, marginTop: '2px' }}>
              {event.complaintTitle}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/complaints/${event.complaintId}`);
            }}
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span>Investigate</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Structured Event Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Event Type
            </div>
            <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
              {event.eventType}
            </div>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Actor Name & Role
            </div>
            <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
              {event.actor}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
              {event.role}
            </div>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Department
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
              {event.department}
            </div>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Municipal Ward
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
              {event.ward}
            </div>
          </div>
        </div>

        {/* Action Description */}
        <div
          style={{
            padding: '14px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Full Operational Description & Justification
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-ink)', lineHeight: 1.45, fontWeight: 500 }}>
            {event.action}
          </div>
        </div>

        {/* Technical Ledger Metadata */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            fontSize: '0.72rem',
          }}
        >
          <div style={{ fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Audit Ledger Signature Metadata
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--color-ink-muted)' }}>
            <div>Record Digest: <span className="mono" style={{ color: 'var(--color-ink)' }}>SHA256-{event.eventId.replace('AUD-', '')}</span></div>
            <div>Storage Scope: <span style={{ color: 'var(--color-ink)' }}>Append-Only Prototype Session Store</span></div>
            <div>Statutory Status: <span style={{ color: 'var(--color-healthy)', fontWeight: 700 }}>Recorded & Verified</span></div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
