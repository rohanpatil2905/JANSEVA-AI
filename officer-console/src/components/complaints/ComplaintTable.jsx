import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldAlert,
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

export default function ComplaintTable({
  complaints = [],
  loading = false,
  onResetFilters,
}) {
  const navigate = useNavigate();

  // Sorting state
  const [sortField, setSortField] = useState('createdAt'); // 'createdAt' | 'severityScore' | 'priority' | 'slaDeadline'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSort = field => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Priority weight for sorting
  const PRIORITY_WEIGHTS = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  // Sorted complaints (pure non-mutating)
  const sortedComplaints = useMemo(() => {
    const list = [...complaints];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'priority') {
        aVal = PRIORITY_WEIGHTS[a.priority] || 0;
        bVal = PRIORITY_WEIGHTS[b.priority] || 0;
      } else if (sortField === 'createdAt' || sortField === 'slaDeadline') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === 'severityScore') {
        aVal = a.severityScore || 0;
        bVal = b.severityScore || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [complaints, sortField, sortDirection]);

  // Paginated slice
  const totalItems = sortedComplaints.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedComplaints.slice(start, start + pageSize);
  }, [sortedComplaints, currentPage, pageSize]);

  // Authenticity Badge formatting
  const getAuthenticityBadge = (status, score) => {
    switch (status) {
      case 'Likely Genuine':
        return (
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-healthy)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <ShieldCheck size={12} /> {status} ({score}%)
          </span>
        );
      case 'Suspicious':
        return (
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-critical)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <ShieldAlert size={12} /> {status} ({score}%)
          </span>
        );
      case 'Needs Verification':
      default:
        return (
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-moderate)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <AlertTriangle size={12} /> {status} ({score}%)
          </span>
        );
    }
  };

  const renderSortHeader = (label, field) => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        style={{
          padding: '10px 12px',
          fontWeight: 700,
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          color: isActive ? 'var(--color-primary)' : 'var(--color-ink-muted)',
          backgroundColor: isActive ? 'var(--color-primary-tint)' : 'transparent',
          transition: 'background-color 0.1s ease',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          {isActive ? (
            sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
          ) : (
            <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
          )}
        </div>
      </th>
    );
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Table Container (Horizontal Scroll on Small Screens) */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>ID</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)', minWidth: '220px' }}>Title & Description</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>Category</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>Location / Ward</th>
              {renderSortHeader('Priority', 'priority')}
              {renderSortHeader('Severity', 'severityScore')}
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>Authenticity</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>Department</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>Assigned Officer</th>
              {renderSortHeader('SLA State', 'slaDeadline')}
              {renderSortHeader('Submitted', 'createdAt')}
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)' }}>Status</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-ink-muted)', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td colSpan={13} style={{ padding: '14px 12px' }}>
                    <Skeleton height={20} />
                  </td>
                </tr>
              ))
            ) : paginatedComplaints.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <EmptyState
                    title="No Matching Citizen Grievances"
                    description="No complaints matched your current search and filter combination."
                    actionLabel="Reset All Filters"
                    onAction={onResetFilters}
                  />
                </td>
              </tr>
            ) : (
              paginatedComplaints.map(item => {
                const isCritical = item.priority === 'Critical';
                return (
                  <tr
                    key={item.complaintId}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: isCritical ? 'rgba(220, 38, 38, 0.015)' : '#FFFFFF',
                      transition: 'background-color 0.1s ease',
                    }}
                    className="table-row-hover"
                  >
                    {/* 1. Complaint ID */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        onClick={() => navigate(`/complaints/${item.complaintId}`)}
                        className="mono"
                        style={{
                          fontWeight: 800,
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {item.complaintId}
                      </span>
                    </td>

                    {/* 2. Title */}
                    <td style={{ padding: '12px 12px', maxWidth: '240px' }}>
                      <div
                        onClick={() => navigate(`/complaints/${item.complaintId}`)}
                        style={{
                          fontWeight: 700,
                          color: 'var(--color-ink)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.3,
                        }}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--color-ink-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {item.description}
                      </div>
                    </td>

                    {/* 3. Category */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                        {item.category}
                      </span>
                    </td>

                    {/* 4. Location / Ward */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{item.ward}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} color="var(--color-ink-faint)" />
                        <span>{item.location.split(',')[0]}</span>
                      </div>
                    </td>

                    {/* 5. Priority */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <PriorityBadge priority={item.priority} severityScore={item.severityScore} />
                    </td>

                    {/* 6. Severity Score */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: isCritical ? 'var(--color-critical)' : 'var(--color-ink)' }}>
                          {item.severityScore}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-faint)' }}>/100</span>
                      </div>
                    </td>

                    {/* 7. Authenticity */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      {getAuthenticityBadge(item.authenticityStatus, item.authenticityScore)}
                    </td>

                    {/* 8. Department */}
                    <td style={{ padding: '12px 12px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                        {item.department.split('&')[0]}
                      </span>
                    </td>

                    {/* 9. Assigned Officer */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--color-ink)' }}>
                        <User size={12} color="var(--color-ink-faint)" />
                        <span>{item.assignedOfficer ? item.assignedOfficer.split('(')[0] : 'UNASSIGNED'}</span>
                      </div>
                    </td>

                    {/* 10. SLA */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            color: item.slaStatus === 'BREACHED' ? 'var(--color-critical)' : item.slaStatus === 'AT RISK' ? 'var(--color-high)' : 'var(--color-healthy)',
                          }}
                        >
                          {item.slaStatus}
                        </span>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                          {item.slaRemainingHours > 0 ? `${item.slaRemainingHours}h left` : 'Overdue'}
                        </div>
                      </div>
                    </td>

                    {/* 11. Submitted */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                      <div>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-faint)' }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* 12. Status */}
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={item.status} />
                    </td>

                    {/* 13. Action */}
                    <td style={{ padding: '12px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => navigate(`/complaints/${item.complaintId}`)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Review <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalItems > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: 'var(--color-surface-sunken)',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.75rem',
            color: 'var(--color-ink-muted)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> &ndash;{' '}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
            <strong>{totalItems}</strong> complaints
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: currentPage === 1 ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    border: isCurrent ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isCurrent ? 'var(--color-primary)' : '#FFFFFF',
                    color: isCurrent ? '#FFFFFF' : 'var(--color-ink)',
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: currentPage === totalPages ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
