import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import { FaShieldAlt, FaSignInAlt, FaLock, FaBuilding, FaHandsHelping } from 'react-icons/fa';

export default function OfficerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/officer/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      if (data.user?.role !== 'officer' && data.user?.role !== 'admin') {
        setError('This account does not have municipal officer privileges.');
        return;
      }
      showToast(`Welcome, Officer ${data.user?.name || ''}! Console active.`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid officer credentials. Please verify your email and password.');
    }
  };

  const handleDemoFill = (officerEmail) => {
    setEmail(officerEmail || 'officer@test.com');
    setPassword('pass123');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '50px 0', display: 'flex', alignItems: 'center' }}>
        <div className="container container-narrow">
          <div style={{ marginBottom: '20px' }}>
            <BackButton to="/" label="Home" style={{ color: '#ffffff', borderColor: '#334155', background: '#1e293b' }} />
          </div>

          <div
            className="card"
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              padding: '40px 32px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
            }}
          >
            {/* Officer Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--emerald-600))',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginBottom: '14px',
                  boxShadow: '0 4px 14px rgba(0, 110, 230, 0.4)',
                }}
              >
                <FaShieldAlt />
              </div>
              <h2 style={{ fontSize: '1.7rem', color: '#ffffff', marginBottom: '6px' }}>
                Municipal Officer Console
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Secure operational login for department officers and municipal supervisors.
              </p>
            </div>

            {/* Demo Helper Pill */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(0, 110, 230, 0.12)',
                border: '1px solid rgba(0, 110, 230, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                Demo Officer Desk: <strong>officer@test.com</strong>
              </div>
              <button
                type="button"
                onClick={() => handleDemoFill('officer@test.com')}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                Auto-fill
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid var(--critical-text)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fca5a5',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="officerEmail" style={{ color: '#e2e8f0' }}>
                  Official Email Address
                </label>
                <input
                  id="officerEmail"
                  type="email"
                  className="form-input"
                  placeholder="e.g., officer@test.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#ffffff',
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="officerPassword" style={{ color: '#e2e8f0' }}>
                  Security Password
                </label>
                <input
                  id="officerPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#ffffff',
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '12px' }}
              >
                <FaSignInAlt /> {loading ? 'Verifying Credentials...' : 'Sign In to Officer Console'}
              </button>
            </form>

            <div
              style={{
                marginTop: '28px',
                paddingTop: '20px',
                borderTop: '1px solid #334155',
                textAlign: 'center',
                fontSize: '0.88rem',
                color: '#94a3b8',
              }}
            >
              Are you a citizen filing a grievance?{' '}
              <Link to="/citizen/login" style={{ fontWeight: 600, color: 'var(--saffron-400)' }}>
                Citizen Portal Login &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
