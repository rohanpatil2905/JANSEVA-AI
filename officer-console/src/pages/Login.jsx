import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MUNICIPAL_ROLES, officers } from '../mock/officers';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [emailOrId, setEmailOrId] = useState('rohan.patil@gov.in');
  const [password, setPassword] = useState('MunicipalPass#2026');
  const [selectedRole, setSelectedRole] = useState(MUNICIPAL_ROLES.ZONAL_OFFICER);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async e => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      showError('Please enter your Officer ID or official municipal email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login({ emailOrId, password, selectedRole });
      showSuccess(`Authenticated as ${session.user.name} (${session.user.role})`, 'Officer Authorized');
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPersonaSelect = officer => {
    setSelectedRole(officer.role);
    setEmailOrId(officer.email);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        backgroundImage: 'radial-gradient(circle at 50% 25%, #1E293B 0%, #0A1120 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            padding: '26px 24px',
            color: '#FFFFFF',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Building2 size={24} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', color: '#FFFFFF', margin: 0 }}>
            JANSEVA AI
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', margin: '4px 0 0', letterSpacing: '0.02em' }}>
            Officer Console &bull; Municipal Grievance Operations
          </p>
          <div
            style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            PUNE MUNICIPAL CORPORATION (PMC)
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {/* Main Headings */}
          <div style={{ marginBottom: '18px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Officer Sign In
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '3px' }}>
              Secure access to the municipal grievance operations console.
            </p>
          </div>

          {/* Prototype Persona Selector */}
          <div
            style={{
              marginBottom: '18px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Prototype Personas (Demo):
              </span>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                Click to autofill
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {officers.map(off => {
                const isSelected = selectedRole === off.role;

                return (
                  <button
                    type="button"
                    key={off.id}
                    onClick={() => handleQuickPersonaSelect(off)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-tint)' : '#FFFFFF',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)',
                      fontSize: '0.6875rem',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{off.name}</span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-ink-muted)' }}>{off.role.slice(0, 24)}...</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.625rem', color: 'var(--color-ink-muted)', marginTop: '6px', textAlign: 'center' }}>
              * Prototype authentication — backend authentication will be connected during integration.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Officer ID / Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                Officer ID / Municipal Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', color: 'var(--color-ink-faint)' }} />
                <input
                  type="text"
                  value={emailOrId}
                  onChange={e => setEmailOrId(e.target.value)}
                  placeholder="e.g. OFF-WARD-12 or rohan.patil@gov.in"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px 0 36px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.8125rem',
                    backgroundColor: 'var(--color-surface-sunken)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--color-ink-faint)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter security passphrase"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 36px 0 36px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.8125rem',
                    backgroundColor: 'var(--color-surface-sunken)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '10px', color: 'var(--color-ink-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ width: '14px', height: '14px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', cursor: 'pointer' }}>
                Remember this device for subsequent sessions
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
                border: 'none',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Verifying Authorization...' : 'Sign In to Officer Console'}
              {!isSubmitting && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Secondary Footer Links */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
            Need access? <strong style={{ color: 'var(--color-primary)' }}>Contact Municipal System Administrator</strong>
          </div>

          {/* Security Notice */}
          <div
            style={{
              marginTop: '16px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              fontSize: '0.65rem',
              color: 'var(--color-ink-muted)',
              textAlign: 'center',
              lineHeight: 1.35,
            }}
          >
            🔒 Authorized government municipal officer access only. All actions and status transitions are recorded in the immutable audit ledger.
          </div>
        </div>
      </div>
    </div>
  );
}
