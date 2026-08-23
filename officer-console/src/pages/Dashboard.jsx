import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import PriorityQueue from '../components/dashboard/PriorityQueue';
import SLAAlert from '../components/dashboard/SLAAlert';
import RecentComplaints from '../components/dashboard/RecentComplaints';
import HotspotOverview from '../components/dashboard/HotspotOverview';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { getDashboardStats, getComplaints, getHotspots } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [statsRes, complaintsRes, hotspotsRes] = await Promise.all([
        getDashboardStats(),
        getComplaints(),
        getHotspots(),
      ]);

      setStats(statsRes);
      setComplaints(complaintsRes);
      setHotspots(hotspotsRes);

      if (isManual) {
        showSuccess('Dashboard telemetry refreshed successfully.', 'Live Update');
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Unable to load municipal dashboard telemetry. Please retry.');
      showError('Failed to fetch latest grievance telemetry.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const refreshTimer = window.setInterval(() => fetchDashboardData(), 5000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  // Category chart colors
  const CATEGORY_COLORS = ['#0A365C', '#0284C7', '#059669', '#D97706', '#4F46E5', '#DC2626'];

  if (error && !stats) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <EmptyState
          title="Operational Telemetry Unavailable"
          description={error}
          actionLabel="Retry Connection"
          onAction={() => fetchDashboardData()}
          icon={AlertTriangle}
        />
      </div>
    );
  }

  return (
    <div className="dashboard animate-fade-in">
      {/* Top Operational Header */}
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
              JANSEVA AI &bull; OFFICER CONTROL CENTER
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
              Citywide Operational Snapshot &bull; 20 Sample Grievances
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            Municipal Grievance Operations Dashboard
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Monitor citywide citizen grievances, AI-prioritized cases and SLA risk across municipal jurisdictions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}
          </button>

          <button
            onClick={() => navigate('/complaints')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Inbox size={14} /> Grievance Inbox (20)
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Stat Cards in single balanced row on desktop) */}
      <div className="dashboard__kpi-grid">
        {loading || !stats ? (
          <>
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
          </>
        ) : (
          <>
            <StatCard
              title="Total Complaints"
              value={stats.totalComplaints}
              trend={`+${stats.todayNewSubmissions} today`}
              subtext="Citywide municipal records"
              icon={FileText}
              variant="default"
              onClick={() => navigate('/complaints')}
            />
            <StatCard
              title="Open Complaints"
              value={stats.openComplaints}
              subtext="Pending officer review & action"
              icon={Inbox}
              variant="default"
              onClick={() => navigate('/complaints?status=In%20Progress')}
            />
            <StatCard
              title="Critical Complaints"
              value={stats.criticalComplaints}
              subtext={`${stats.criticalRequiringReview} require immediate review`}
              icon={AlertTriangle}
              variant="critical"
              onClick={() => navigate('/complaints?priority=Critical')}
            />
            <StatCard
              title="SLA At Risk"
              value={stats.slaAtRisk}
              subtext={`${stats.slaDueWithin4Hours} due within 4 hours`}
              icon={Clock}
              variant="high"
              onClick={() => navigate('/sla')}
            />
            <StatCard
              title="Resolved Today"
              value={stats.resolvedToday}
              subtext="Verified & closed with citizen confirmation"
              icon={CheckCircle2}
              variant="healthy"
              onClick={() => navigate('/complaints?status=Resolved')}
            />
          </>
        )}
      </div>

      {/* Main Grid: AI Priority Queue (68%) & SLA Alerts (32%) */}
      <div className="dashboard__main-grid">
        <PriorityQueue complaints={complaints} loading={loading} />
        <SLAAlert stats={stats || {}} complaints={complaints} />
      </div>

      {/* Secondary Grid: Recent Complaints (68%) & Hotspot Overview (32%) */}
      <div className="dashboard__secondary-grid">
        <RecentComplaints complaints={complaints} loading={loading} />
        <HotspotOverview hotspots={hotspots} loading={loading} />
      </div>

      {/* Tertiary Row: Compact Operational Analytics Preview */}
      {stats?.categoryBreakdown && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                Complaints Volume by Municipal Department
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                Citywide departmental grievance load distribution
              </p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Full Analytics & AI Evaluation &rarr;
            </button>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
