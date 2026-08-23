import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  pageSize = 10,
  onRowClick,
  emptyTitle = 'No records found',
  emptyMessage = 'Try adjusting your search query or active filter criteria.',
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
        <Skeleton count={6} height={40} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-sunken)', borderBottom: '1px solid var(--color-border)' }}>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  onClick={() => col.sortable !== false && col.key && handleSort(col.key)}
                  style={{
                    padding: '10px 14px',
                    textAlign: col.align || 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--color-ink-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: col.sortable !== false && col.key ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.header}
                    {col.sortable !== false && col.key && (
                      <ArrowUpDown size={12} style={{ opacity: sortConfig.key === col.key ? 1 : 0.4 }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rIdx) => (
              <tr
                key={row.id || row.fieldId || row.caseId || row.alertId || rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.12s ease',
                  backgroundColor: 'var(--color-surface)',
                }}
                onMouseEnter={e => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-surface-sunken)';
                }}
                onMouseLeave={e => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                }}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key || cIdx}
                    style={{
                      padding: '12px 14px',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-ink)',
                      textAlign: col.align || 'left',
                      whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-sunken)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-ink-muted)',
          }}
        >
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, sortedData.length)}</strong> of <strong>{sortedData.length}</strong> items
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                background: currentPage === 1 ? 'transparent' : 'var(--color-surface)',
                opacity: currentPage === 1 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                background: currentPage === totalPages ? 'transparent' : 'var(--color-surface)',
                opacity: currentPage === totalPages ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
