import React from 'react';
import { Filter, RotateCcw, X, Check } from 'lucide-react';
import { MUNICIPAL_CATEGORIES, MUNICIPAL_DEPARTMENTS, MUNICIPAL_WARDS } from '../../data/mockData';

export default function ComplaintFilters({
  filters,
  onChange,
  onReset,
  counts = {},
  totalCount = 0,
}) {
  const isAnyFilterActive =
    filters.priority !== 'All' ||
    filters.status !== 'All' ||
    filters.slaStatus !== 'All' ||
    filters.authenticity !== 'All' ||
    filters.department !== 'All' ||
    filters.category !== 'All' ||
    filters.ward !== 'All' ||
    Boolean(filters.quickFilter);

  const handleDropdownChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
      quickFilter: null, // clear quick chip when manual dropdown changed
    });
  };

  const handleQuickFilterClick = chipKey => {
    if (filters.quickFilter === chipKey) {
      // Toggle off
      onReset();
    } else {
      // Apply preset
      const next = {
        priority: 'All',
        status: 'All',
        slaStatus: 'All',
        authenticity: 'All',
        department: 'All',
        category: 'All',
        ward: 'All',
        quickFilter: chipKey,
      };

      if (chipKey === 'Critical') next.priority = 'Critical';
      if (chipKey === 'High') next.priority = 'High';
      if (chipKey === 'SLA Risk') next.slaStatus = 'AT RISK';
      if (chipKey === 'Breached') next.slaStatus = 'BREACHED';
      if (chipKey === 'Suspicious') next.authenticity = 'Suspicious';
      if (chipKey === 'Needs Review') next.authenticity = 'Needs Verification';

      onChange(next);
    }
  };

  const QUICK_CHIPS = [
    { key: 'All', label: 'All Grievances', count: totalCount },
    { key: 'Critical', label: 'Critical Priority', count: counts.critical || 0, color: 'var(--color-critical)' },
    { key: 'High', label: 'High Priority', count: counts.high || 0, color: 'var(--color-high)' },
    { key: 'SLA Risk', label: 'SLA At Risk', count: counts.slaAtRisk || 0, color: 'var(--color-high)' },
    { key: 'Breached', label: 'SLA Breached', count: counts.slaBreached || 0, color: 'var(--color-critical)' },
    { key: 'Suspicious', label: 'Suspicious / Abuse', count: counts.suspicious || 0, color: '#D97706' },
    { key: 'Needs Review', label: 'Human Review Needed', count: counts.needsReview || 0, color: 'var(--color-ai)' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Row 1: Quick Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginRight: '4px' }}>
            Quick Filters:
          </span>

          {QUICK_CHIPS.map(chip => {
            const isActive =
              chip.key === 'All'
                ? !filters.quickFilter && !isAnyFilterActive
                : filters.quickFilter === chip.key;

            return (
              <button
                type="button"
                key={chip.key}
                onClick={() => handleQuickFilterClick(chip.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isActive ? 'var(--color-primary-tint)' : 'var(--color-surface-sunken)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-ink)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                <span>{chip.label}</span>
                <span
                  style={{
                    padding: '1px 5px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? 'var(--color-primary)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : (chip.color || 'var(--color-ink-muted)'),
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {isAnyFilterActive && (
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-critical-border)',
              backgroundColor: 'var(--color-critical-bg)',
              color: 'var(--color-critical)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Clear Filters
          </button>
        )}
      </div>

      {/* Row 2: Granular Filter Dropdowns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-surface-sunken)',
        }}
      >
        {/* Priority */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={e => handleDropdownChange('priority', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={e => handleDropdownChange('status', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="AI Classified">AI Classified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* SLA Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            SLA Status
          </label>
          <select
            value={filters.slaStatus}
            onChange={e => handleDropdownChange('slaStatus', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
          >
            <option value="All">All SLA States</option>
            <option value="ON TRACK">On Track</option>
            <option value="AT RISK">At Risk</option>
            <option value="BREACHED">Breached</option>
          </select>
        </div>

        {/* Authenticity */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            Authenticity
          </label>
          <select
            value={filters.authenticity}
            onChange={e => handleDropdownChange('authenticity', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
          >
            <option value="All">All Authenticity</option>
            <option value="Likely Genuine">Likely Genuine</option>
            <option value="Needs Verification">Needs Verification</option>
            <option value="Suspicious">Suspicious</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            Category
          </label>
          <select
            value={filters.category}
            onChange={e => handleDropdownChange('category', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
          >
            <option value="All">All Categories</option>
            {MUNICIPAL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={e => handleDropdownChange('department', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
          >
            <option value="All">All Departments</option>
            {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px' }}>
            Ward
          </label>
          <select
            value={filters.ward}
            onChange={e => handleDropdownChange('ward', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)' }}
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
