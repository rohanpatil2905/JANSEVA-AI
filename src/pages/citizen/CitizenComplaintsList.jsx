import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { complaintsAPI } from '../../services/api';
import { FaSearch, FaFilter, FaPlusCircle, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

export default function CitizenComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintsAPI.list();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your grievances from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filterTabs = [
    { id: 'ALL', label: 'All Grievances' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'closed', label: 'Closed' },
  ];

  const filtered = complaints.filter((item) => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchSearch =
      searchTerm === '' ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tracking_code && item.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/citizen/dashboard" label="Dashboard" />
        <Link to="/citizen/submit" className="btn btn-accent btn-sm">
          <FaPlusCircle /> File New Grievance
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>My Registered Grievances</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Track the progress, status timeline, and official municipal responses.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, keyword, tracking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <FaSearch
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            overflowX: 'auto',
          }}
        >
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your registered grievances..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComplaints} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching grievances found"
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filter tab.'
              : 'You have not submitted any complaints yet.'
          }
          actionLabel={searchTerm || statusFilter !== 'ALL' ? 'Clear Filters' : 'File a Grievance'}
          onAction={searchTerm || statusFilter !== 'ALL' ? () => { setSearchTerm(''); setStatusFilter('ALL'); } : null}
          actionLink={!searchTerm && statusFilter === 'ALL' ? '/citizen/submit' : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card animate-fade-in"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <StatusBadge status={item.status} />
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--primary-700)',
                      background: 'var(--primary-50)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {item.tracking_code || item.id.slice(0, 8)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '10px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCalendarAlt /> {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  {item.language && <span>Language: {item.language.toUpperCase()}</span>}
                </div>
              </div>

              <Link to={`/citizen/complaint/${item.id}`} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                View Details <FaChevronRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
