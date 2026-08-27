import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintsAPI } from '../../services/api';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import {
  FaPlusCircle,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaMicrophone,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from 'react-icons/fa';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintsAPI.list();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your grievances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const inProgress = complaints.filter((c) => c.status === 'in_progress' || c.status === 'submitted').length;
  const resolved = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <div className="container">
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--primary-900), var(--primary-700))',
          color: '#ffffff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--saffron-400)',
            }}
          >
            Citizen Dashboard
          </span>
          <h1 style={{ color: '#ffffff', fontSize: '2rem', marginTop: '4px', marginBottom: '8px' }}>
            Namaste, {user?.name || 'Citizen'}!
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '540px' }}>
            Report civic issues in your neighborhood, track municipal resolution in real time, and confirm completed works.
          </p>
        </div>

        <Link
          to="/citizen/submit"
          className="btn btn-accent btn-lg"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}
        >
          <FaMicrophone /> File New Grievance
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            <FaClipboardList />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Grievances Filed
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--high-bg)',
              color: 'var(--high-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            <FaClock />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{inProgress}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Active / In Progress
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--emerald-50)',
              color: 'var(--emerald-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            <FaCheckCircle />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{resolved}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Resolved Issues
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Grievances Feed */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '14px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem' }}>Your Recent Grievances</h3>
            {complaints.length > 0 && (
              <Link to="/citizen/my-complaints" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                View All ({complaints.length}) &rarr;
              </Link>
            )}
          </div>

          {loading ? (
            <LoadingState message="Loading your grievances..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchComplaints} />
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No grievances filed yet"
              description="Report any pothole, water leak, garbage buildup, or streetlight failure to municipal officials."
              actionLabel="File Your First Grievance"
              actionLink="/citizen/submit"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {complaints.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    backgroundColor: '#ffffff',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <StatusBadge status={item.status} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.tracking_code || 'ID: ' + item.id.slice(0, 8)}
                      </span>
                    </div>
                    <h4
                      style={{
                        fontSize: '1rem',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Filed on {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Link to={`/citizen/complaint/${item.id}`} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                    View &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips & Helpline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '10px' }}>💡 Tips for Faster Redressal</h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Record audio in your local language — our AI transcribes automatically.</li>
              <li>Attach a clear photo of the civic defect.</li>
              <li>Enable GPS location or state the exact street/ward name.</li>
              <li>Once resolved, confirm the work or reopen if dissatisfied.</li>
            </ul>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '1.05rem', marginBottom: '12px' }}>Emergency Municipal Helplines</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Water Supply Emergency:</span>
                <strong style={{ color: 'var(--primary-700)' }}>1916</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Electricity Breakdown:</span>
                <strong style={{ color: 'var(--primary-700)' }}>1912</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Solid Waste & Sanitation:</span>
                <strong style={{ color: 'var(--primary-700)' }}>1800-22-1234</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
