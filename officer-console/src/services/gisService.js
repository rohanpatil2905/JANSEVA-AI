// ============================================================================
// JanSeva AI — GIS & Geospatial Intelligence Service
// ============================================================================
// Deterministically calculates ward hotspots, SVG spatial projections, and cluster analysis
// from the authoritative municipal complaint dataset, with backend REST endpoints ready.

import { MUNICIPAL_WARDS } from '../data/mockData';
import { apiClient, isApiMode } from './apiClient';
import { getComplaints } from './api';

// Normalized SVG Ward Polygon Coordinate Paths for Pune Municipal Corporation (PMC)
export const WARD_SVG_BOUNDS = {
  'Ward 12': {
    name: 'Hadapsar & Swargate Zone',
    path: 'M 480,260 L 680,230 L 720,380 L 590,460 L 460,370 Z',
    center: { x: 580, y: 330 },
    color: '#0284c7',
  },
  'Ward 10': {
    name: 'Kothrud & Karve Nagar Zone',
    path: 'M 140,240 L 320,210 L 330,360 L 190,420 L 110,330 Z',
    center: { x: 220, y: 310 },
    color: '#0ea5e9',
  },
  'Ward 08': {
    name: 'Shivajinagar & FC Road Zone',
    path: 'M 320,180 L 460,170 L 480,290 L 330,320 Z',
    center: { x: 390, y: 240 },
    color: '#38bdf8',
  },
  'Ward 15': {
    name: 'Bibvewadi & Katraj Zone',
    path: 'M 330,360 L 460,340 L 470,510 L 260,530 L 230,420 Z',
    center: { x: 360, y: 440 },
    color: '#0369a1',
  },
  'Ward 04': {
    name: 'Aundh & Baner Zone',
    path: 'M 160,80 L 340,70 L 320,190 L 150,210 Z',
    center: { x: 240, y: 140 },
    color: '#7dd3fc',
  },
  'Ward 07': {
    name: 'Viman Nagar & Nagar Road Zone',
    path: 'M 460,60 L 670,70 L 680,210 L 460,170 Z',
    center: { x: 560, y: 130 },
    color: '#bae6fd',
  },
};

/**
 * Calculate deterministic SVG Canvas (X, Y) Coordinates for a Complaint
 */
export function getComplaintSVGCoordinates(complaint, index = 0) {
  const wardKey = complaint.ward || 'Ward 12';
  const bounds = WARD_SVG_BOUNDS[wardKey] || WARD_SVG_BOUNDS['Ward 12'];

  // If GPS coordinates exist, use bounded offset projection
  if (complaint.coordinates?.lat && complaint.coordinates?.lng) {
    // Pune Center approx: 18.5204 N, 73.8567 E
    const latOffset = (complaint.coordinates.lat - 18.52) * 1200;
    const lngOffset = (complaint.coordinates.lng - 73.86) * 1200;

    // Constrain to ward center radius
    const x = Math.min(Math.max(bounds.center.x + lngOffset, bounds.center.x - 75), bounds.center.x + 75);
    const y = Math.min(Math.max(bounds.center.y - latOffset, bounds.center.y - 65), bounds.center.y + 65);
    return { x: Math.round(x), y: Math.round(y) };
  }

  // Deterministic fallback based on complaint ID hash
  let hash = 0;
  for (let i = 0; i < complaint.complaintId.length; i++) {
    hash = (hash << 5) - hash + complaint.complaintId.charCodeAt(i);
    hash |= 0;
  }
  const angle = Math.abs(hash % 360) * (Math.PI / 180);
  const radius = 25 + Math.abs((hash >> 4) % 45);

  return {
    x: Math.round(bounds.center.x + Math.cos(angle) * radius),
    y: Math.round(bounds.center.y + Math.sin(angle) * radius),
  };
}

/**
 * Calculate Dynamic Ward Hotspots & Operational Risk Scores from Complaints
 */
export function calculateWardHotspots(complaints = []) {
  const wardMap = {};

  // Initialize all wards
  MUNICIPAL_WARDS.forEach(w => {
    wardMap[w.wardId] = {
      wardId: w.wardId,
      name: w.name,
      areaKm2: w.areaKm2,
      totalPopulation: w.totalPopulation,
      totalComplaints: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      slaRiskCount: 0,
      slaBreachedCount: 0,
      suspiciousCount: 0,
      duplicateClustersCount: 0,
      dominantCategory: 'General',
      categories: {},
      departments: {},
      complaintIds: [],
    };
  });

  // Aggregate complaints
  complaints.forEach(c => {
    const wId = c.ward && wardMap[c.ward] ? c.ward : 'Ward 12';
    const ward = wardMap[wId];

    ward.totalComplaints += 1;
    ward.complaintIds.push(c.complaintId);

    if (c.priority === 'Critical') ward.criticalCount += 1;
    else if (c.priority === 'High') ward.highCount += 1;
    else if (c.priority === 'Medium') ward.mediumCount += 1;
    else ward.lowCount += 1;

    if (c.slaStatus === 'AT RISK') ward.slaRiskCount += 1;
    if (c.slaStatus === 'BREACHED') ward.slaBreachedCount += 1;
    if (c.authenticityStatus === 'Suspicious') ward.suspiciousCount += 1;
    if (c.duplicateCount && c.duplicateCount > 5) ward.duplicateClustersCount += 1;

    const cat = c.category || 'Other';
    ward.categories[cat] = (ward.categories[cat] || 0) + 1;

    const dept = (c.department || 'General').split('&')[0].trim();
    ward.departments[dept] = (ward.departments[dept] || 0) + 1;
  });

  // Calculate Operational Hotspot Score (0–100) & Dominant Category
  const hotspotsList = Object.values(wardMap).map(ward => {
    // Dominant category
    let topCat = 'General';
    let maxCatCount = 0;
    Object.entries(ward.categories).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCat = cat;
      }
    });
    ward.dominantCategory = topCat;

    // Deterministic formula for Operational Hotspot Score
    // Weightings: Critical (24pt), SLA Risk/Breach (18pt), High (12pt), Total Volume (5pt), Suspicious (8pt)
    const rawScore =
      ward.criticalCount * 24 +
      (ward.slaRiskCount + ward.slaBreachedCount) * 18 +
      ward.highCount * 12 +
      ward.totalComplaints * 5 +
      ward.suspiciousCount * 8 +
      ward.duplicateClustersCount * 4;

    const hotspotScore = Math.min(100, Math.max(12, Math.round(rawScore)));

    let riskTier = 'LOW';
    if (hotspotScore >= 80) riskTier = 'CRITICAL';
    else if (hotspotScore >= 60) riskTier = 'HIGH';
    else if (hotspotScore >= 40) riskTier = 'MODERATE';

    return {
      ...ward,
      hotspotScore,
      riskTier,
    };
  });

  // Sort descending by hotspot score
  return hotspotsList.sort((a, b) => b.hotspotScore - a.hotspotScore);
}

/**
 * Group Complaints into Corroborating Spatial / Semantic Clusters
 */
export function getComplaintClusters(complaints = []) {
  const clusters = {};

  complaints.forEach(c => {
    const key = c.masterIssueId || `${c.ward}-${c.category}`;
    if (!clusters[key]) {
      clusters[key] = {
        clusterId: key,
        primaryTitle: c.title,
        ward: c.ward,
        category: c.category,
        department: c.department,
        severityScore: c.severityScore,
        priority: c.priority,
        totalReports: c.duplicateCount || 1,
        complaints: [],
        primaryLocation: c.location,
        coordinates: c.coordinates,
        confidence: c.aiConfidence || 90,
      };
    }
    clusters[key].complaints.push(c);
  });

  return Object.values(clusters).filter(cl => cl.totalReports > 1 || cl.complaints.length > 1);
}

// ============================================================================
// Async REST Contract Methods
// ============================================================================

/**
 * Fetch Ward Boundaries & Geometry
 * Endpoint: GET /gis/wards
 */
export async function getWardBoundaries() {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/gis/wards');
      return data;
    } catch (err) {
      console.warn('[gisService] getWardBoundaries backend call failed, using prototype:', err.message);
    }
  }
  return {
    bounds: WARD_SVG_BOUNDS,
    wards: MUNICIPAL_WARDS,
  };
}

/**
 * Fetch Geospatial Locations for All Active Complaints
 * Endpoint: GET /gis/locations
 */
export async function getComplaintLocations(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/gis/locations', { params: filters });
      return data;
    } catch (err) {
      console.warn('[gisService] getComplaintLocations backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return complaints.map(c => ({
    complaintId: c.complaintId,
    title: c.title,
    coordinates: c.coordinates,
    svgCoords: getComplaintSVGCoordinates(c),
    priority: c.priority,
    ward: c.ward,
    status: c.status,
  }));
}

/**
 * Fetch Ward Hotspots Intelligence
 * Endpoint: GET /gis/hotspots
 */
export async function getHotspots(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/gis/hotspots', { params: filters });
      return data;
    } catch (err) {
      console.warn('[gisService] getHotspots backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return calculateWardHotspots(complaints);
}

/**
 * Fetch Corroborating Spatial Clusters
 * Endpoint: GET /gis/clusters
 */
export async function getClusters(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/gis/clusters', { params: filters });
      return data;
    } catch (err) {
      console.warn('[gisService] getClusters backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getComplaintClusters(complaints);
}

/**
 * Fetch Summary Intelligence for a Specific Ward
 * Endpoint: GET /gis/wards/:id/summary
 */
export async function getWardSummary(wardId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/gis/wards/${wardId}/summary`);
      return data;
    } catch (err) {
      console.warn(`[gisService] getWardSummary backend call failed for ${wardId}, using prototype:`, err.message);
    }
  }
  const complaints = await getComplaints({ ward: wardId });
  const allHotspots = calculateWardHotspots(complaints);
  return allHotspots.find(w => w.wardId === wardId) || null;
}
