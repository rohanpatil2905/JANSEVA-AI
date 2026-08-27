import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import { FaHandsHelping, FaSignInAlt, FaUserCheck, FaLock, FaEnvelope } from 'react-icons/fa';

export default function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/citizen/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      showToast(`Welcome back, ${data.user?.name || 'Citizen'}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoFill = () => {
    setEmail('citizen@janseva.ai');
    setPassword('password123');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container container-narrow">
          <div style={{ marginBottom: '20px' }}>
            <BackButton to="/" label="Home" />
          </div>

          <div
            className="card"
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'var(--saffron-50)',
                  color: 'var(--saffron-600)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: '12px',
                }}
              >
                <FaHandsHelping />
              </div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Citizen Portal Login
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Access your grievances, track progress, and submit civic issues.
              </p>
            </div>

            {/* Demo Fill Helper */}
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--saffron-50)',
                border: '1px dashed var(--saffron-400)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--saffron-600)' }}>
                Demo Citizen: <strong>citizen@janseva.ai</strong>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--saffron-600)', fontWeight: 700, padding: '2px 8px' }}
              >
                Auto-fill Demo
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--critical-bg)',
                  border: '1px solid var(--critical-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--critical-text)',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="e.g., citizen@janseva.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-accent btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
              >
                <FaSignInAlt /> {loading ? 'Logging in...' : 'Sign In as Citizen'}
              </button>
            </form>

            <div
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div>
                Don't have an account?{' '}
                <Link to="/citizen/register" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                  Register here
                </Link>
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                Are you a Municipal Official?{' '}
                <Link to="/officer/login" style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
                  Officer Console Login &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
