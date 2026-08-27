import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function LoadingState({ message = 'Loading data...', minHeight = '240px' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '32px 16px',
        gap: '14px',
        color: 'var(--text-muted)',
      }}
    >
      <FaSpinner
        className="animate-spin"
        style={{ fontSize: '2rem', color: 'var(--primary-600)' }}
      />
      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
}
