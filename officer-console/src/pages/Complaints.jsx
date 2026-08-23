import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import ComplaintFilters from '../components/complaints/ComplaintFilters';
import ComplaintTable from '../components/complaints/ComplaintTable';
import EmptyState from '../components/ui/EmptyState';
import { getComplaints } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Complaints() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search input state
  const initialSearch = searchParams.get('search') || '';
  const initialPriority = searchParams.get('priority') || 'All';
  const initialStatus = searchParams.get('status') || 'All';
  const initialSla = searchParams.get('sla') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    priority: initialPriority,
    status: initialStatus,
    slaStatus: initialSla,
    authenticity: 'All',
    department: 'All',
    category: 'All',
    ward: 'All',
    quickFilter: null,
  });

  const fetchComplaintsData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getComplaints();
      setAllComplaints(data);
      if (isManual) {
        showSuccess('Grievance registry refreshed.', 'Live Update');
      }
    } catch (err) {
      console.error('Failed to fetch complaints', err);
      setError('Unable to load citizen grievance registry.');
      showError('Failed to fetch complaints from service layer.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  // Synchronize URL search params when search or priority changes
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filters.priority !== 'All') params.priority = filters.priority;
    if (filters.status !== 'All') params.status = filters.status;
    if (filters.slaStatus !== 'All') params.sla = filters.slaStatus;
    setSearchParams(params, { replace: true });
  }, [searchTerm, filters, setSearchParams]);

  // Derived filter counts directly from authoritative master dataset returned by getComplaints()
  const counts = useMemo(() => {
    const critical = allComplaints.filter(c => c.priority === 'Critical').length;
    const high = allComplaints.filter(c => c.priority === 'High').length;
    const slaAtRisk = allComplaints.filter(c => c.slaStatus === 'AT RISK').length;
    const slaBreached = allComplaints.filter(c => c.slaStatus === 'BREACHED').length;
    const suspicious = allComplaints.filter(c => c.authenticityStatus === 'Suspicious').length;
    const needsReview = allComplaints.filter(c => c.authenticityStatus === 'Needs Verification').length;
    return { critical, high, slaAtRisk, slaBreached, suspicious, needsReview };
  }, [allComplaints]);

  // Filtered dataset matching search + all active filters
  const filteredComplaints = useMemo(() => {
    let list = [...allComplaints];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        c =>
          c.complaintId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.ward.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          (c.assignedOfficer && c.assignedOfficer.toLowerCase().includes(q))
      );
    }

    if (filters.priority !== 'All') {
      list = list.filter(c => c.priority === filters.priority);
    }

    if (filters.status !== 'All') {
      list = list.filter(c => c.status === filters.status);
    }

    if (filters.slaStatus !== 'All') {
      list = list.filter(c => c.slaStatus === filters.slaStatus);
    }

    if (filters.authenticity !== 'All') {
      list = list.filter(c => c.authenticityStatus === filters.authenticity);
    }

    if (filters.department !== 'All') {
      list = list.filter(c => c.department === filters.department);
    }

    if (filters.category !== 'All') {
      list = list.filter(c => c.category === filters.category);
    }

    if (filters.ward !== 'All') {
      list = list.filter(c => c.ward === filters.ward);
    }

    return list;
  }, [allComplaints, searchTerm, filters]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      priority: 'All',
      status: 'All',
      slaStatus: 'All',
      authenticity: 'All',
      department: 'All',
      category: 'All',
      ward: 'All',
      quickFilter: null,
    });
  };

  if (error && allComplaints.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <EmptyState
          title="Grievance Registry Unavailable"
          description={error}
          actionLabel="Retry Loading"
          onAction={() => fetchComplaintsData()}
          icon={AlertTriangle}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Operational Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '20px 24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              GRIEVANCE OPERATIONS REGISTRY
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface-sunken)',
                color: 'var(--color-ink-muted)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                border: '1px solid var(--color-border)',
              }}
            >
              Prototype Sample Grievance Registry (20 Detailed Records)
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            Grievance Management
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Review, filter and route citizen complaints across municipal departments
          </p>
        </div>

        {/* Header Right Action & Summary Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div>
              Total: <strong>{allComplaints.length}</strong>
            </div>
            <span style={{ opacity: 0.3 }}>|</span>
            <div style={{ color: 'var(--color-critical)', fontWeight: 700 }}>
              {counts.critical} Critical
            </div>
            <span style={{ opacity: 0.3 }}>|</span>
            <div style={{ color: 'var(--color-high)', fontWeight: 600 }}>
              {counts.slaAtRisk} SLA Risk
            </div>
          </div>

          <button
            onClick={() => fetchComplaintsData(true)}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--color-ink-faint)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search complaints by ID, title, description, category, ward, location, or officer..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            height: '46px',
            padding: '0 40px 0 46px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-ink)',
            boxShadow: 'var(--shadow-xs)',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '14px',
              padding: '4px',
              color: 'var(--color-ink-faint)',
              borderRadius: '50%',
            }}
            title="Clear search text"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters (Quick Chips + Dropdowns) */}
      <ComplaintFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        counts={counts}
        totalCount={allComplaints.length}
      />

      {/* Complaints Table */}
      <ComplaintTable
        complaints={filteredComplaints}
        loading={loading}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
