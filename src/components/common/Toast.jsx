import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

let triggerToastCallback = null;

export const showToast = (message, type = 'info', duration = 4000) => {
  if (triggerToastCallback) {
    triggerToastCallback(message, type, duration);
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    triggerToastCallback = (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    return () => {
      triggerToastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
      }}
    >
      {toasts.map((toast) => {
        const bg =
          toast.type === 'success'
            ? 'var(--emerald-700)'
            : toast.type === 'error'
            ? 'var(--critical-text)'
            : 'var(--primary-800)';

        const Icon =
          toast.type === 'success'
            ? FaCheckCircle
            : toast.type === 'error'
            ? FaExclamationCircle
            : FaInfoCircle;

        return (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              background: bg,
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon style={{ fontSize: '1.1rem', flexShrink: 0 }} />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px',
                display: 'flex',
              }}
            >
              <FaTimes />
            </button>
          </div>
        );
      })}
    </div>
  );
}
