import React from 'react';
import { UserCheck, Sparkles, User } from 'lucide-react';

export default function ActorActivityTable({
  actors = [],
  selectedActor,
  onSelectActor,
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
          <UserCheck size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Actor Activity & Operational Accountability
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Click an actor to filter the ledger
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              <th style={{ padding: '10px 12px' }}>Actor & Identity</th>
              <th style={{ padding: '10px 12px' }}>Role / Classification</th>
              <th style={{ padding: '10px 12px' }}>Total Events</th>
              <th style={{ padding: '10px 12px' }}>Last Operational Action</th>
              <th style={{ padding: '10px 12px' }}>Escalations</th>
              <th style={{ padding: '10px 12px' }}>Resolutions</th>
            </tr>
          </thead>
          <tbody>
            {actors.map(a => {
              const isSelected = selectedActor === a.actor;

              return (
                <tr
                  key={a.actor}
                  onClick={() => onSelectActor?.(isSelected ? '' : a.actor)}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-tint)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  className="hover-shadow-sm"
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
                      {a.actor}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-ink-muted)' }}>
                    {a.role}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {a.totalEvents}
                  </td>
                  <td style={{ padding: '10px 12px', maxWidth: '280px' }}>
                    <div style={{ color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>
                      {a.lastAction}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: a.escalations > 0 ? 'var(--color-critical)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                    {a.escalations}
                  </td>
                  <td style={{ padding: '10px 12px', color: a.resolutions > 0 ? 'var(--color-healthy)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                    {a.resolutions}
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
