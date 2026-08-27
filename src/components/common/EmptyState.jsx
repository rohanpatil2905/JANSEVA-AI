import React from 'react';
import { FaInbox } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = <FaInbox />,
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  actionLabel = null,
  actionLink = null,
  onAction = null,
  minHeight = '220px',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '36px 20px',
        textAlign: 'center',
        gap: '12px',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: '1.4rem',
        }}
      >
        {icon}
      </div>

      <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{title}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionLink && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
