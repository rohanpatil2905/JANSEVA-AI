import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import { FaHandsHelping, FaUserPlus, FaCheckCircle } from 'react-icons/fa';

export default function CitizenRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const data = await register({
        name,
        email,
        phone: phone || null,
        password,
        role: 'citizen',
      });
      showToast(`Account created! Welcome to JanSeva AI, ${data.user?.name}!`, 'success');
      navigate('/citizen/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please verify your details.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container container-narrow">
          <div style={{ marginBottom: '20px' }}>
            <BackButton to="/citizen/login" label="Back to Login" />
          </div>

          <div
            className="card"
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
                Citizen Registration
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Create your JanSeva AI citizen profile to file and track civic grievances.
              </p>
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
                <label className="form-label" htmlFor="name">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="e.g., rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g., 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-accent btn-lg"
                style={{ width: '100%', marginTop: '12px' }}
              >
                <FaUserPlus /> {loading ? 'Creating Profile...' : 'Register Citizen Profile'}
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
              }}
            >
              Already registered?{' '}
              <Link to="/citizen/login" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
