import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
            JanSeva AI
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>
            Verifying Officer Credentials...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  const isRoleUnauthorized = allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role);
  // Permission check
  const isPermissionUnauthorized = requiredPermission && !hasPermission(requiredPermission);

  if (isRoleUnauthorized || isPermissionUnauthorized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-critical-bg)',
            border: '1px solid var(--color-critical-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--color-critical)',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
          Statutory Access Restricted
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', maxWidth: '440px', lineHeight: 1.5, margin: '0 0 20px 0' }}>
          Your current municipal persona (<strong>{user?.name}</strong> &mdash; <em>{user?.role}</em>) does not hold statutory executive authority for this module.
        </p>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            height: '38px',
            padding: '0 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <ArrowLeft size={15} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return children;
}
