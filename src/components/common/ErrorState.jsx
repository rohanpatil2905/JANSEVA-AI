import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please check your connection and try again.',
  onRetry = null,
  minHeight = '240px',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '32px 20px',
        textAlign: 'center',
        gap: '12px',
        background: 'var(--critical-bg)',
        border: '1px solid var(--critical-border)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '600px',
        margin: '20px auto',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--critical-text)',
          fontSize: '1.25rem',
        }}
      >
        <FaExclamationTriangle />
      </div>

      <h3 style={{ color: 'var(--critical-text)', fontSize: '1.15rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
        {typeof message === 'string' ? message : JSON.stringify(message)}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FaRedo /> Try Again
        </button>
      )}
    </div>
  );
}
