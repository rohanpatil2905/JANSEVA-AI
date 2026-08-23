import React from 'react';
import { MapPin, Flame, AlertTriangle, Clock, Copy, ShieldAlert } from 'lucide-react';

export default function GISKPIBar({
  complaints = [],
  hotspots = [],
}) {
  const totalMapped = complaints.length;
  const hotspotWardsCount = hotspots.filter(h => h.hotspotScore >= 60).length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical').length;
  const slaRiskCount = complaints.filter(
    c => c.slaStatus === 'AT RISK' || c.slaStatus === 'BREACHED'
  ).length;
  const duplicateClustersCount = complaints.filter(
    c => c.duplicateCount && c.duplicateCount > 5
  ).length;

  const kpis = [
    {
      label: 'TOTAL MAPPED COMPLAINTS',
      value: totalMapped,
      subtext: 'Active spatial telemetry',
      icon: MapPin,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
    },
    {
      label: 'HOTSPOT WARDS',
      value: hotspotWardsCount,
      subtext: 'High/Critical risk index',
      icon: Flame,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'CRITICAL CLUSTERS',
      value: criticalCount,
      subtext: 'Requires emergency crew',
      icon: AlertTriangle,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'SLA RISK ZONES',
      value: slaRiskCount,
      subtext: 'Impending / breached deadlines',
      icon: Clock,
      color: 'var(--color-high)',
      bg: 'var(--color-high-bg)',
    },
    {
      label: 'DUPLICATE CLUSTERS',
      value: duplicateClustersCount,
      subtext: 'Corroborating issue groups',
      icon: Copy,
      color: 'var(--color-ai)',
      bg: 'var(--color-ai-tint)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}
    >
      {kpis.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--color-ink-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                {card.label}
              </span>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={13} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.1 }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
