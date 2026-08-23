import React from 'react';
import { Building2 } from 'lucide-react';

export default function DepartmentVolumeChart({ departments = [] }) {
  const maxCount = departments.length > 0 ? Math.max(...departments.map(d => d.count), 1) : 1;

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Complaint Volume by Municipal Department
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Sorted by caseload density
        </span>
      </div>

      {/* Horizontal Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {departments.map(dept => {
          const barWidth = Math.max(6, Math.round((dept.count / maxCount) * 100));

          return (
            <div key={dept.department} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                  {dept.department}
                </span>
                <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>
                  <strong>{dept.count}</strong> ({dept.percentage}%)
                </span>
              </div>

              <div
                style={{
                  height: '8px',
                  backgroundColor: 'var(--color-surface-sunken)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
