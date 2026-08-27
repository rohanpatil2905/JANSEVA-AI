import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BackButton from '../components/common/BackButton';
import { StatusBadge, SeverityBadge } from '../components/common/Badge';
import { complaintsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaClock, FaCheckCircle, FaFileAlt, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

export default function PublicTrack() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState(null);
  const [error, setError] = useState('');
  const { isAuthenticated, isCitizen } = useAuth();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setError('');
    setLoading(false);

    if (!isAuthenticated) {
      setError('Please login to your citizen account to inspect tracking details.');
      return;
    }

    setLoading(true);
    try {
      // If code is UUID or tracking code, check complaints list
      const data = await complaintsAPI.list();
      const match = data.complaints?.find(
        (c) =>
          c.id === code.trim() ||
          (c.tracking_code && c.tracking_code.toUpperCase() === code.trim().toUpperCase())
      );

      if (match) {
        const full = await complaintsAPI.getById(match.id);
        setComplaintData(full);
      } else {
        setError(`No grievance found matching code "${code.trim()}". Please verify the code.`);
        setComplaintData(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to locate grievance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('code') && isAuthenticated) {
      handleSearch();
    }
  }, [searchParams, isAuthenticated]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container container-narrow">
          <div style={{ marginBottom: '24px' }}>
            <BackButton to="/" label="Home" />
          </div>

          <div className="card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                <FaSearch />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>Track Grievance Redressal</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Enter your unique tracking code or Complaint ID to check live status.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., JAN-2026-6B2A89 or UUID"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flexShrink: 0 }}>
                {loading ? 'Searching...' : 'Search Status'}
              </button>
            </form>

            {!isAuthenticated && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--saffron-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--saffron-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--saffron-600)' }}>
                  <FaLock />
                  <span>Citizen login is required to inspect grievance details securely.</span>
                </div>
                <Link to="/citizen/login" className="btn btn-accent btn-sm">
                  Citizen Login
                </Link>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--critical-bg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--critical-text)',
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Results View */}
          {complaintData && (
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{complaintData.complaint?.title}</h3>
                    <StatusBadge status={complaintData.complaint?.status} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Tracking Code: <strong style={{ color: 'var(--primary-700)' }}>{complaintData.complaint?.tracking_code || complaintData.complaint?.id}</strong>
                  </div>
                </div>

                <Link to={`/citizen/complaint/${complaintData.complaint?.id}`} className="btn btn-secondary btn-sm">
                  Full Details & Confirmation &rarr;
                </Link>
              </div>

              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Grievance Description
                </strong>
                {complaintData.complaint?.description}
              </div>

              {/* Status Timeline */}
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Resolution Progress
                </strong>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                    <FaCheckCircle style={{ color: 'var(--emerald-600)' }} />
                    <span>Submitted: {new Date(complaintData.complaint?.created_at).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                    <FaClock style={{ color: 'var(--primary-600)' }} />
                    <span>Current Status: <strong style={{ textTransform: 'capitalize' }}>{complaintData.complaint?.status?.replace('_', ' ')}</strong></span>
                  </div>
                </div>
              </div>

              {complaintData.complaint?.response_translation && (
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: 'var(--emerald-50)',
                    border: '1px solid var(--emerald-100)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <strong style={{ color: 'var(--emerald-700)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                    Officer Official Response:
                  </strong>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {complaintData.complaint.response_translation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
