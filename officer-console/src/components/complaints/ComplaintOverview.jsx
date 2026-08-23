import React from 'react';
import {
  Layers,
  MapPin,
  Flame,
  Sparkles,
  ShieldCheck,
  Copy,
  Clock,
  Building,
} from 'lucide-react';

export default function ComplaintOverview({ complaint }) {
  if (!complaint) return null;

  const items = [
    {
      label: 'Grievance Category',
      value: complaint.category,
      icon: Layers,
      color: 'var(--color-primary)',
    },
    {
      label: 'Ward & Location',
      value: `${complaint.ward} • ${complaint.location.split(',')[0]}`,
      icon: MapPin,
      color: 'var(--color-ink)',
    },
    {
      label: 'AI Severity Score',
      value: `${complaint.severityScore} / 100 (${complaint.priority})`,
      icon: Flame,
      color: complaint.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)',
      highlight: true,
    },
    {
      label: 'AI Triage Confidence',
      value: `${complaint.aiConfidence}%`,
      icon: Sparkles,
      color: 'var(--color-ai)',
    },
    {
      label: 'Authenticity Verification',
      value: `${complaint.authenticityStatus} (${complaint.authenticityScore}%)`,
      icon: ShieldCheck,
      color: complaint.authenticityStatus === 'Suspicious' ? 'var(--color-critical)' : 'var(--color-healthy)',
    },
    {
      label: 'Duplicate / Cluster Reports',
      value: `${complaint.duplicateCount} Similar Reports`,
      icon: Copy,
      color: 'var(--color-ink)',
    },
    {
      label: 'SLA Urgency State',
      value: `${complaint.slaStatus} ${complaint.slaRemainingHours > 0 ? `(${complaint.slaRemainingHours}h remaining)` : '(Breached)'}`,
      icon: Clock,
      color: complaint.slaStatus === 'BREACHED' ? 'var(--color-critical)' : complaint.slaStatus === 'AT RISK' ? 'var(--color-high)' : 'var(--color-healthy)',
    },
    {
      label: 'Assigned Department',
      value: complaint.department.split('&')[0],
      icon: Building,
      color: 'var(--color-primary)',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: item.highlight ? 'rgba(220, 38, 38, 0.03)' : 'var(--color-surface-sunken)',
                borderRadius: 'var(--radius-sm)',
                border: item.highlight ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <Icon size={15} color={item.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: item.color,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={item.value}
                >
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
