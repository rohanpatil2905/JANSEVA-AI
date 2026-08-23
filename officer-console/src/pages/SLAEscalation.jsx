import React, { useState, useEffect, useMemo } from 'react';
import SLAHeader from '../components/sla/SLAHeader';
import SLAKPIBar from '../components/sla/SLAKPIBar';
import SLAPressureBar from '../components/sla/SLAPressureBar';
import SLAFilters from '../components/sla/SLAFilters';
import SLAPriorityQueue from '../components/sla/SLAPriorityQueue';
import EscalationMatrix from '../components/sla/EscalationMatrix';
import DepartmentSLATable from '../components/sla/DepartmentSLATable';
import OfficerWorkloadTable from '../components/sla/OfficerWorkloadTable';
import Skeleton from '../components/ui/Skeleton';
import { getComplaints } from '../services/api';
import {
  getSLAOverview,
  getDepartmentSLAStats,
  getOfficerSLAWorkload,
  getEscalationSummary,
} from '../services/slaService';
import { useToast } from '../context/ToastContext';

export default function SLAEscalation() {
  const { showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All',
    slaStatus: 'All',
    department: 'All',
    ward: 'All',
    escalationLevel: 'All',
  });

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load SLA records', err);
      showError('Failed to fetch SLA complaint data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  // Calculate SLA metrics
  const overview = useMemo(() => getSLAOverview(complaints), [complaints]);
  const departmentStats = useMemo(() => getDepartmentSLAStats(complaints), [complaints]);
  const officerWorkloads = useMemo(() => getOfficerSLAWorkload(complaints), [complaints]);
  const escalationSummary = useMemo(() => getEscalationSummary(complaints), [complaints]);

  // Filtered complaints for the priority queue
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Exclude already resolved/confirmed tickets from urgent SLA attention queue
      if (c.status === 'Resolved' || c.status === 'Citizen Confirmed' || c.status === 'Rejected') {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          c.complaintId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.ward.toLowerCase().includes(q) ||
          (c.assignedOfficer && c.assignedOfficer.toLowerCase().includes(q)) ||
          c.department.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Selected officer click filter
      if (selectedOfficer) {
        if (!c.assignedOfficer || !c.assignedOfficer.includes(selectedOfficer)) {
          return false;
        }
      }

      // Priority
      if (filters.priority !== 'All' && c.priority !== filters.priority) return false;

      // SLA Status
      if (filters.slaStatus !== 'All' && c.slaStatus !== filters.slaStatus) return false;

      // Department
      if (filters.department !== 'All' && c.department !== filters.department) return false;

      // Ward
      if (filters.ward !== 'All' && c.ward !== filters.ward) return false;

      // Escalation Level
      if (filters.escalationLevel !== 'All') {
        const lvl = String(c.escalationLevel || 1);
        if (lvl !== filters.escalationLevel) return false;
      }

      return true;
    });
  }, [complaints, searchTerm, selectedOfficer, filters]);

  const handleComplaintUpdated = updated => {
    setComplaints(prev =>
      prev.map(c => (c.complaintId === updated.complaintId ? updated : c))
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedOfficer('');
    setFilters({
      priority: 'All',
      slaStatus: 'All',
      department: 'All',
      ward: 'All',
      escalationLevel: 'All',
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={80} />
        <Skeleton height={90} />
        <Skeleton height={120} />
        <Skeleton height={300} />
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
      <SLAHeader />

      {/* 2. Dynamically Derived SLA KPIs */}
      <SLAKPIBar overview={overview} />

      {/* 3. Horizontal SLA Pressure Overview */}
      <SLAPressureBar overview={overview} />

      {/* 4. Filter Toolbar */}
      <SLAFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Immediate SLA Attention & Priority Triage Queue */}
      <SLAPriorityQueue
        complaints={filteredComplaints}
        onComplaintUpdated={handleComplaintUpdated}
      />

      {/* 6. Two-Column Analytics: Escalation Matrix & Department Performance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left: Administrative Escalation Matrix */}
        <EscalationMatrix summary={escalationSummary} />

        {/* Right: Departmental SLA Compliance Table */}
        <DepartmentSLATable departmentStats={departmentStats} />
      </div>

      {/* 7. Officer SLA Workload & Urgency Matrix */}
      <OfficerWorkloadTable
        officers={officerWorkloads}
        selectedOfficer={selectedOfficer}
        onSelectOfficer={setSelectedOfficer}
      />
    </div>
  );
}
