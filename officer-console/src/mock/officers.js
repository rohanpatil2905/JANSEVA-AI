// ============================================================================
// JanSeva AI — Municipal Officer Personas & Role Definitions
// ============================================================================

export const MUNICIPAL_ROLES = {
  COMMISSIONER: 'Senior Municipal Commissioner',
  ZONAL_OFFICER: 'Zonal Ward Officer',
  WATER_HEAD: 'Water Operations Head',
  ROADS_ENGINEER: 'Roads & Infrastructure Engineer',
  SANITATION_SUPERVISOR: 'Sanitation Supervisor',
  SAFETY_OFFICER: 'Public Safety Officer',
};

export const ROLES = MUNICIPAL_ROLES;

export const officers = [
  {
    id: 'OFF-WARD-12',
    name: 'Rohan Patil',
    email: 'rohan.patil@gov.in',
    role: MUNICIPAL_ROLES.ZONAL_OFFICER,
    initials: 'RP',
    department: 'Municipal Zonal Administration (Ward 10–15)',
    jurisdiction: 'Ward 12 – Hadapsar & Swargate Zone',
    phone: '+91 98201-44910',
    assignedWards: ['Ward 10', 'Ward 11', 'Ward 12', 'Ward 13', 'Ward 14', 'Ward 15'],
    activeSince: '2023-04-15',
  },
  {
    id: 'COMM-001',
    name: 'Rajesh Verma, IAS',
    email: 'rajesh.verma@gov.in',
    role: MUNICIPAL_ROLES.COMMISSIONER,
    initials: 'RV',
    department: 'Office of the Municipal Commissioner (Pune Municipal Corporation)',
    jurisdiction: 'All Municipal Wards (Citywide)',
    phone: '+91 98110-99887',
    assignedWards: ['All Wards'],
    activeSince: '2020-01-10',
  },
  {
    id: 'OFF-WTR-02',
    name: 'Suresh Patil',
    email: 'suresh.patil@water.gov.in',
    role: MUNICIPAL_ROLES.WATER_HEAD,
    initials: 'SP',
    department: 'Water Supply & Operations Department',
    jurisdiction: 'Central & Eastern Water Grids',
    phone: '+91 94220-11234',
    assignedWards: ['Ward 04', 'Ward 08', 'Ward 12', 'Ward 15'],
    activeSince: '2021-08-01',
  },
  {
    id: 'OFF-RDS-03',
    name: 'Priya Sharma',
    email: 'priya.sharma@roads.gov.in',
    role: MUNICIPAL_ROLES.ROADS_ENGINEER,
    initials: 'PS',
    department: 'Roads & Infrastructure Department',
    jurisdiction: 'South & Western Transit Corridors',
    phone: '+91 97654-32109',
    assignedWards: ['Ward 03', 'Ward 07', 'Ward 12', 'Ward 42'],
    activeSince: '2022-02-12',
  },
  {
    id: 'OFF-SNT-04',
    name: 'Vikram Desai',
    email: 'vikram.desai@sanitation.gov.in',
    role: MUNICIPAL_ROLES.SANITATION_SUPERVISOR,
    initials: 'VD',
    department: 'Solid Waste Management & Sanitation Department',
    jurisdiction: 'Hadapsar & Kothrud Circles',
    phone: '+91 98900-55443',
    assignedWards: ['Ward 12', 'Ward 15', 'Ward 18', 'Ward 24'],
    activeSince: '2023-11-01',
  },
  {
    id: 'OFF-SEC-05',
    name: 'Meena Joshi',
    email: 'meena.joshi@safety.gov.in',
    role: MUNICIPAL_ROLES.SAFETY_OFFICER,
    initials: 'MJ',
    department: 'Public Safety & Emergency Response',
    jurisdiction: 'Metro Surveillance & Crisis Response',
    phone: '+91 98225-88771',
    assignedWards: ['All Wards'],
    activeSince: '2024-01-15',
  },
];
