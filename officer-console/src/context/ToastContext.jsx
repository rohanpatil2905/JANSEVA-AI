import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, title, message, type };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg, title = 'Success') => addToast({ type: 'success', title, message: msg }), [addToast]);
  const showError = useCallback((msg, title = 'Error') => addToast({ type: 'error', title, message: msg }), [addToast]);
  const showWarning = useCallback((msg, title = 'Warning') => addToast({ type: 'warning', title, message: msg }), [addToast]);
  const showInfo = useCallback((msg, title = 'Information') => addToast({ type: 'info', title, message: msg }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
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
          width: 'calc(100% - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const bg = isSuccess ? '#ECFDF5' : isError ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#EFF6FF';
          const border = isSuccess ? '#A7F3D0' : isError ? '#FECACA' : isWarning ? '#FDE68A' : '#BFDBFE';
          const textColor = isSuccess ? '#065F46' : isError ? '#991B1B' : isWarning ? '#92400E' : '#1E40AF';
          const iconColor = isSuccess ? '#059669' : isError ? '#DC2626' : isWarning ? '#D97706' : '#2563EB';

          const IconComponent = isSuccess ? CheckCircle2 : isError ? AlertCircle : isWarning ? AlertTriangle : Info;

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '12px 14px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              <IconComponent size={18} color={iconColor} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: textColor, marginBottom: '2px' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.8125rem', color: textColor, lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: textColor, opacity: 0.7, padding: '2px', flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
