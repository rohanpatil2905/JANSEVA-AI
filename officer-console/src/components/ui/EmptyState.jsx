import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items available',
  message = 'There is currently no data to display.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface-sunken)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-ink-faint)',
          marginBottom: '12px',
        }}
      >
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', maxWidth: '380px', lineHeight: 1.4 }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
