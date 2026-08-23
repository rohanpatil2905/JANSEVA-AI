import React from 'react';
import { User, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function OfficerWorkloadTable({
  officers = [],
  selectedOfficer,
  onSelectOfficer,
}) {
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
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Officer SLA Workload & Urgency Matrix
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Click an officer to filter active queue
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              <th style={{ padding: '10px 12px' }}>Officer & Role</th>
              <th style={{ padding: '10px 12px' }}>Department</th>
              <th style={{ padding: '10px 12px' }}>Assigned</th>
              <th style={{ padding: '10px 12px' }}>At Risk</th>
              <th style={{ padding: '10px 12px' }}>Breached</th>
              <th style={{ padding: '10px 12px' }}>Critical</th>
              <th style={{ padding: '10px 12px' }}>Escalated</th>
            </tr>
          </thead>
          <tbody>
            {officers.map(off => {
              const isSelected = selectedOfficer === off.name;

              return (
                <tr
                  key={off.name}
                  onClick={() => onSelectOfficer?.(isSelected ? '' : off.name)}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-tint)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  className="hover-shadow-sm"
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
                      {off.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                      {off.role}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-ink-muted)' }}>
                    {off.department.split('&')[0]}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--color-ink)' }}>
                    {off.assignedCount}
                  </td>
                  <td style={{ padding: '10px 12px', color: off.atRiskCount > 0 ? 'var(--color-high)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                    {off.atRiskCount}
                  </td>
                  <td style={{ padding: '10px 12px', color: off.breachedCount > 0 ? 'var(--color-critical)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                    {off.breachedCount}
                  </td>
                  <td style={{ padding: '10px 12px', color: off.criticalCount > 0 ? 'var(--color-critical)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                    {off.criticalCount}
                  </td>
                  <td style={{ padding: '10px 12px', color: off.escalatedCount > 0 ? 'var(--color-ai)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                    {off.escalatedCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
