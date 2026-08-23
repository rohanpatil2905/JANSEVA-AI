import React from 'react';
import { Building2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function DepartmentSLATable({ departmentStats = [] }) {
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
          <Building2 size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Departmental SLA Performance & Compliance
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Derived from active municipal caseload
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              <th style={{ padding: '10px 12px' }}>Department</th>
              <th style={{ padding: '10px 12px' }}>Active</th>
              <th style={{ padding: '10px 12px' }}>On Track</th>
              <th style={{ padding: '10px 12px' }}>At Risk</th>
              <th style={{ padding: '10px 12px' }}>Breached</th>
              <th style={{ padding: '10px 12px' }}>Compliance Rate</th>
              <th style={{ padding: '10px 12px' }}>Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {departmentStats.map((dept, idx) => (
              <tr key={dept.department} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {dept.department}
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                  {dept.totalActive}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--color-healthy)', fontWeight: 700 }}>
                  {dept.onTrack}
                </td>
                <td style={{ padding: '10px 12px', color: dept.atRisk > 0 ? 'var(--color-high)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                  {dept.atRisk}
                </td>
                <td style={{ padding: '10px 12px', color: dept.breached > 0 ? 'var(--color-critical)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                  {dept.breached}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, minWidth: '45px', maxWidth: '65px', height: '6px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${dept.complianceRate}%`,
                          height: '100%',
                          backgroundColor: dept.complianceRate >= 80 ? 'var(--color-healthy)' : dept.complianceRate >= 60 ? 'var(--color-high)' : 'var(--color-critical)',
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', color: dept.complianceRate >= 80 ? 'var(--color-healthy)' : 'var(--color-high)' }}>
                      {dept.complianceRate}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>
                  Sample Registry
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
