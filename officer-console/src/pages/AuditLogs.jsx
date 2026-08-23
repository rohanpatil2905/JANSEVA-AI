import React, { useState, useEffect, useMemo } from 'react';
import AuditHeader from '../components/audit/AuditHeader';
import AuditKPIBar from '../components/audit/AuditKPIBar';
import AuditFilters from '../components/audit/AuditFilters';
import AuditLedgerTable from '../components/audit/AuditLedgerTable';
import AuditEventDrawer from '../components/audit/AuditEventDrawer';
import ComplaintLifecycleTrace from '../components/audit/ComplaintLifecycleTrace';
import StatutoryComplianceMonitor from '../components/audit/StatutoryComplianceMonitor';
import ActorActivityTable from '../components/audit/ActorActivityTable';
import EventDistributionChart from '../components/audit/EventDistributionChart';
import LedgerIntegrityNotice from '../components/audit/LedgerIntegrityNotice';
import Skeleton from '../components/ui/Skeleton';
import { getComplaints } from '../services/api';
import {
  getEnrichedAuditLedger,
  getAuditSummary,
  getActorActivity,
  getEventDistribution,
  getComplianceMonitor,
  exportAuditCSV,
} from '../services/auditService';
import { useToast } from '../context/ToastContext';

export default function AuditLogs() {
  const { showSuccess, showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [filters, setFilters] = useState({
    eventType: 'All',
    actorType: 'All',
    status: 'All',
    department: 'All',
    ward: 'All',
  });

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load audit complaints', err);
      showError('Failed to fetch audit ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  // Compute full enriched audit ledger
  const allAuditRecords = useMemo(() => {
    return getEnrichedAuditLedger(complaints);
  }, [complaints]);

  // Compute analytics
  const summary = useMemo(() => getAuditSummary(allAuditRecords), [allAuditRecords]);
  const actorActivity = useMemo(() => getActorActivity(allAuditRecords), [allAuditRecords]);
  const eventDistribution = useMemo(() => getEventDistribution(allAuditRecords), [allAuditRecords]);
  const complianceData = useMemo(() => getComplianceMonitor(complaints, allAuditRecords), [complaints, allAuditRecords]);

  // Filtered audit records for the main ledger table
  const filteredRecords = useMemo(() => {
    return allAuditRecords.filter(r => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          r.eventId.toLowerCase().includes(q) ||
          r.complaintId.toLowerCase().includes(q) ||
          r.actor.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.ward.toLowerCase().includes(q) ||
          r.action.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Selected actor click filter
      if (selectedActor && r.actor !== selectedActor) return false;

      // Event Type
      if (filters.eventType !== 'All' && r.eventType !== filters.eventType) return false;

      // Actor Type
      if (filters.actorType !== 'All' && r.actorType !== filters.actorType) return false;

      // Status
      if (filters.status !== 'All' && r.status !== filters.status) return false;

      // Department
      if (filters.department !== 'All' && r.department !== filters.department) return false;

      // Ward
      if (filters.ward !== 'All' && r.ward !== filters.ward) return false;

      return true;
    });
  }, [allAuditRecords, searchTerm, selectedActor, filters]);

  const handleExportCSV = () => {
    const success = exportAuditCSV(filteredRecords);
    if (success) {
      showSuccess(`Exported ${filteredRecords.length} audit records to CSV.`);
    } else {
      showError('No records available to export.');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedActor('');
    setFilters({
      eventType: 'All',
      actorType: 'All',
      status: 'All',
      department: 'All',
      ward: 'All',
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={80} />
        <Skeleton height={90} />
        <Skeleton height={400} />
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
      {/* 1. Header & Governance Notice with CSV Export */}
      <AuditHeader onExport={handleExportCSV} recordCount={filteredRecords.length} />

      {/* 2. Dynamically Derived 8-KPI Strip */}
      <AuditKPIBar summary={summary} />

      {/* 3. Filter Toolbar */}
      <AuditFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Immutable Investigation Ledger Table */}
      <AuditLedgerTable
        records={filteredRecords}
        onSelectEvent={ev => setSelectedEvent(ev)}
      />

      {/* 5. Statutory Compliance & Governance Monitor */}
      <StatutoryComplianceMonitor complianceData={complianceData} />

      {/* 6. Two-Column Section: Single Grievance Lifecycle Trace & Event Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        <ComplaintLifecycleTrace complaints={complaints} initialComplaintId="GRV-2026-0142" />
        <EventDistributionChart distribution={eventDistribution} />
      </div>

      {/* 7. Actor Activity & Operational Accountability Table */}
      <ActorActivityTable
        actors={actorActivity}
        selectedActor={selectedActor}
        onSelectActor={setSelectedActor}
      />

      {/* 8. Append-Only Ledger Integrity Notice */}
      <LedgerIntegrityNotice />

      {/* 9. Event Details Slideout Drawer */}
      <AuditEventDrawer
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
}
