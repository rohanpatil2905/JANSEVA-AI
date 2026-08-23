import React from 'react';

export default function Skeleton({ count = 1, height = 20, width = '100%', style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            width: typeof width === 'number' ? `${width}px` : width,
            backgroundColor: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulseGlow 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}
