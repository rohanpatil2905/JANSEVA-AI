import React, { useState, useEffect, useMemo } from 'react';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsKPIBar from '../components/analytics/AnalyticsKPIBar';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import DepartmentVolumeChart from '../components/analytics/DepartmentVolumeChart';
import PriorityDonut from '../components/analytics/PriorityDonut';
import AIReviewEvaluation from '../components/analytics/AIReviewEvaluation';
import CivicIntegrityAnalytics from '../components/analytics/CivicIntegrityAnalytics';
import DuplicateClusterAnalytics from '../components/analytics/DuplicateClusterAnalytics';
import WardPerformanceTable from '../components/analytics/WardPerformanceTable';
import TrendNotice from '../components/analytics/TrendNotice';
import Skeleton from '../components/ui/Skeleton';
import { getComplaints } from '../services/api';
import {
  getAnalyticsSummary,
  getDepartmentDistribution,
  getPriorityDistribution,
  getAIReviewAnalytics,
  getAuthenticityAnalytics,
  getClusterAnalytics,
  getWardAnalytics,
} from '../services/analyticsService';
import { useToast } from '../context/ToastContext';

export default function Analytics() {
  const { showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    department: 'All',
    ward: 'All',
    priority: 'All',
    slaStatus: 'All',
    authenticity: 'All',
    reviewState: 'All',
  });

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load analytics complaints', err);
      showError('Failed to fetch analytics dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  // Filter complaints based on user filter selections
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (filters.department !== 'All' && c.department !== filters.department) return false;
      if (filters.ward !== 'All' && c.ward !== filters.ward) return false;
      if (filters.priority !== 'All' && c.priority !== filters.priority) return false;
      if (filters.slaStatus !== 'All' && c.slaStatus !== filters.slaStatus) return false;
      if (filters.authenticity !== 'All' && c.authenticityStatus !== filters.authenticity) return false;
      if (filters.reviewState !== 'All') {
        const state = c.aiReviewState || 'PENDING REVIEW';
        if (state !== filters.reviewState) return false;
      }
      return true;
    });
  }, [complaints, filters]);

  // Derived Analytics Data
  const summary = useMemo(() => getAnalyticsSummary(filteredComplaints), [filteredComplaints]);
  const departmentDistribution = useMemo(() => getDepartmentDistribution(filteredComplaints), [filteredComplaints]);
  const priorityDistribution = useMemo(() => getPriorityDistribution(filteredComplaints), [filteredComplaints]);
  const aiReviewStats = useMemo(() => getAIReviewAnalytics(filteredComplaints), [filteredComplaints]);
  const authenticityStats = useMemo(() => getAuthenticityAnalytics(filteredComplaints), [filteredComplaints]);
  const clusterStats = useMemo(() => getClusterAnalytics(filteredComplaints), [filteredComplaints]);
  const wardStats = useMemo(() => getWardAnalytics(filteredComplaints), [filteredComplaints]);

  const handleResetFilters = () => {
    setFilters({
      department: 'All',
      ward: 'All',
      priority: 'All',
      slaStatus: 'All',
      authenticity: 'All',
      reviewState: 'All',
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={80} />
        <Skeleton height={90} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Skeleton height={250} />
          <Skeleton height={250} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1540px',
        margin: '0 auto',
        width: '100%',
        paddingBottom: '40px',
      }}
    >
      {/* 1. Header & Governance Notice */}
      <AnalyticsHeader />

      {/* 2. Dynamically Derived 8-KPI Strip */}
      <AnalyticsKPIBar summary={summary} />

      {/* 3. Filter Controls */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Top Analytics Row: Department Volume & Priority Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        <DepartmentVolumeChart departments={departmentDistribution} />
        <PriorityDonut priorityDistribution={priorityDistribution} />
      </div>

      {/* 5. AI Decision Support Evaluation & HITL Governance */}
      <AIReviewEvaluation aiStats={aiReviewStats} />

      {/* 6. Middle Analytics Row: Civic Integrity & Duplicate Clusters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        <CivicIntegrityAnalytics authenticityStats={authenticityStats} />
        <DuplicateClusterAnalytics clusterStats={clusterStats} />
      </div>

      {/* 7. Ward Operational Overview & Hotspot Ranking */}
      <WardPerformanceTable wardStats={wardStats} />

      {/* 8. Longitudinal Data Notice */}
      <TrendNotice />
    </div>
  );
}
