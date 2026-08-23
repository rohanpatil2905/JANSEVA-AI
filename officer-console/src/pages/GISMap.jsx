import React, { useState, useEffect, useMemo } from 'react';
import GISHeader from '../components/gis/GISHeader';
import GISKPIBar from '../components/gis/GISKPIBar';
import GISFilters from '../components/gis/GISFilters';
import GISMapCanvas from '../components/gis/GISMapCanvas';
import HotspotPanel from '../components/gis/HotspotPanel';
import WardSummary from '../components/gis/WardSummary';
import ClusterDetails from '../components/gis/ClusterDetails';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { getComplaints } from '../services/api';
import { calculateWardHotspots } from '../services/gisService';
import { useToast } from '../context/ToastContext';
import { MapPin } from 'lucide-react';

export default function GISMap() {
  const { showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardId, setSelectedWardId] = useState('Ward 12');
  const [activeClusterComplaint, setActiveClusterComplaint] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All',
    department: 'All',
    ward: 'All',
    slaStatus: 'All',
    authenticity: 'All',
    clusterStatus: 'All',
  });

  // Fetch all authoritative municipal complaints
  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load GIS complaints', err);
      showError('Failed to load GIS spatial telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  // Calculate dynamic ward hotspots
  const hotspots = useMemo(() => {
    return calculateWardHotspots(complaints);
  }, [complaints]);

  // Selected ward data lookup
  const selectedWardData = useMemo(() => {
    return hotspots.find(h => h.wardId === selectedWardId) || hotspots[0];
  }, [hotspots, selectedWardId]);

  // Filter complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          c.complaintId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.ward.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Priority
      if (filters.priority !== 'All' && c.priority !== filters.priority) return false;

      // Department
      if (filters.department !== 'All' && c.department !== filters.department) return false;

      // Ward
      if (filters.ward !== 'All' && c.ward !== filters.ward) return false;

      // SLA Status
      if (filters.slaStatus !== 'All' && c.slaStatus !== filters.slaStatus) return false;

      // Authenticity
      if (filters.authenticity !== 'All' && c.authenticityStatus !== filters.authenticity) return false;

      // Cluster Status
      if (filters.clusterStatus === 'clustered' && (!c.duplicateCount || c.duplicateCount <= 5)) return false;
      if (filters.clusterStatus === 'single' && c.duplicateCount && c.duplicateCount > 5) return false;

      return true;
    });
  }, [complaints, searchTerm, filters]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      priority: 'All',
      department: 'All',
      ward: 'All',
      slaStatus: 'All',
      authenticity: 'All',
      clusterStatus: 'All',
    });
    setSelectedWardId('Ward 12');
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={80} />
        <Skeleton height={90} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <Skeleton height={500} />
          <Skeleton height={500} />
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
      <GISHeader />

      {/* 2. Dynamically Derived KPI Summary Strip */}
      <GISKPIBar complaints={filteredComplaints} hotspots={hotspots} />

      {/* 3. GIS Search & Layer Filter Controls */}
      <GISFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Main Two-Column GIS Workspace (Left: ~67% Map Canvas | Right: ~33% Intelligence Sidebar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(480px, 1fr) minmax(320px, 420px)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Interactive Municipal GIS Map Canvas */}
        <div>
          <GISMapCanvas
            complaints={filteredComplaints}
            hotspots={hotspots}
            selectedWardId={selectedWardId}
            onSelectWard={wId => setSelectedWardId(wId)}
            onSelectCluster={complaint => setActiveClusterComplaint(complaint)}
          />
        </div>

        {/* Right Column: Municipal Hotspot Ranking & Ward Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top: Ranked Hotspot Wards */}
          <HotspotPanel
            hotspots={hotspots}
            selectedWardId={selectedWardId}
            onSelectWard={wId => setSelectedWardId(wId)}
          />

          {/* Bottom: Selected Ward Summary Details */}
          <WardSummary
            wardData={selectedWardData}
            complaints={complaints}
          />
        </div>
      </div>

      {/* 5. Spatial / Duplicate Cluster Inspection Modal */}
      <ClusterDetails
        isOpen={Boolean(activeClusterComplaint)}
        onClose={() => setActiveClusterComplaint(null)}
        complaint={activeClusterComplaint}
      />
    </div>
  );
}
