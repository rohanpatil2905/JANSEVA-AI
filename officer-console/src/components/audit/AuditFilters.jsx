import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { MUNICIPAL_DEPARTMENTS, MUNICIPAL_WARDS } from '../../data/mockData';

export default function AuditFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
}) {
  const handleChange = (key, val) => {
    onFilterChange(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  const isFiltered =
    Boolean(searchTerm.trim()) ||
    filters.eventType !== 'All' ||
    filters.actorType !== 'All' ||
    filters.status !== 'All' ||
    filters.department !== 'All' ||
    filters.ward !== 'All';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Top Row: Search & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-faint)' }} />
          <input
            type="text"
            placeholder="Search audit events, complaint IDs, officers, or departments..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '32px',
              paddingRight: '12px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
            }}
          />
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        )}
      </div>

      {/* Bottom Filter Selectors Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
        }}
      >
        {/* 1. Event Type */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Event Type
          </label>
          <select
            value={filters.eventType}
            onChange={e => handleChange('eventType', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Event Types</option>
            <option value="Complaint Submitted">Complaint Submitted</option>
            <option value="AI Classified">AI Classified</option>
            <option value="AI Reviewed">AI Reviewed (Approved/Modified)</option>
            <option value="Assignment">Assignment</option>
            <option value="Reassignment">Reassignment</option>
            <option value="Status Change">Status Transition</option>
            <option value="Operational Action">Operational Action</option>
            <option value="Evidence Added">Evidence Added</option>
            <option value="Escalation">Escalation</option>
            <option value="Resolution Submitted">Resolution Submitted</option>
            <option value="Citizen Confirmation">Citizen Confirmation</option>
            <option value="Reopened">Reopened</option>
          </select>
        </div>

        {/* 2. Actor Type */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Actor Type
          </label>
          <select
            value={filters.actorType}
            onChange={e => handleChange('actorType', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Actors</option>
            <option value="Officer">Officer (Authority)</option>
            <option value="AI Engine">JanSeva AI (Advisory)</option>
            <option value="Citizen">Citizen</option>
            <option value="System">System</option>
          </select>
        </div>

        {/* 3. Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Grievance Status
          </label>
          <select
            value={filters.status}
            onChange={e => handleChange('status', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="AI Classified">AI Classified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Citizen Confirmed">Citizen Confirmed</option>
            <option value="Reopened">Reopened</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>

        {/* 4. Department */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={e => handleChange('department', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Departments</option>
            {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* 5. Ward */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Ward Zone
          </label>
          <select
            value={filters.ward}
            onChange={e => handleChange('ward', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Wards</option>
            {MUNICIPAL_WARDS.map(w => (
              <option key={w.wardId} value={w.wardId}>
                {w.wardId} ({w.name.split('&')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
