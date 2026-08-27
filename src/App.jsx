import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';
import PublicTrack from './pages/PublicTrack';
import NotFound from './pages/NotFound';

// Citizen Pages & Layout
import CitizenLayout from './components/layout/CitizenLayout';
import CitizenLogin from './pages/citizen/CitizenLogin';
import CitizenRegister from './pages/citizen/CitizenRegister';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitGrievance from './pages/citizen/SubmitGrievance';
import CitizenComplaintsList from './pages/citizen/CitizenComplaintsList';
import CitizenComplaintDetail from './pages/citizen/CitizenComplaintDetail';

// Officer Pages & Layout (The 10 Tools)
import OfficerLayout from './components/layout/OfficerLayout';
import OfficerLogin from './pages/officer/OfficerLogin';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerComplaints from './pages/officer/OfficerComplaints';
import OfficerComplaintDetail from './pages/officer/OfficerComplaintDetail';
import MasterIssues from './pages/officer/MasterIssues';
import GISMap from './pages/officer/GISMap';
import AIInsights from './pages/officer/AIInsights';
import SLAEscalations from './pages/officer/SLAEscalations';
import ReviewQueue from './pages/officer/ReviewQueue';
import Analytics from './pages/officer/Analytics';
import Notifications from './pages/officer/Notifications';
import AuditTimeline from './pages/officer/AuditTimeline';

// Auth Protection Guard
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* 1. Public Entry & Landing */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/track" element={<PublicTrack />} />

      {/* 2. Citizen Authentication Flows */}
      <Route path="/citizen/login" element={<CitizenLogin />} />
      <Route path="/citizen/register" element={<CitizenRegister />} />

      {/* 3. Citizen Portal Protected Routes */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute requiredRole="citizen">
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="submit" element={<SubmitGrievance />} />
        <Route path="my-complaints" element={<CitizenComplaintsList />} />
        <Route path="complaint/:id" element={<CitizenComplaintDetail />} />
      </Route>

      {/* 4. Officer Authentication Flow */}
      <Route path="/officer/login" element={<OfficerLogin />} />

      {/* 5. Officer Console Protected Routes (The 10 Required Tools) */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute requiredRole="officer">
            <OfficerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints" element={<OfficerComplaints />} />
        <Route path="complaints/:id" element={<OfficerComplaintDetail />} />
        <Route path="master-issues" element={<MasterIssues />} />
        <Route path="gis" element={<GISMap />} />
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="sla" element={<SLAEscalations />} />
        <Route path="reviews" element={<ReviewQueue />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit" element={<AuditTimeline />} />
      </Route>

      {/* Legacy Route Aliases & Redirects */}
      <Route path="/login" element={<Navigate to="/citizen/login" replace />} />
      <Route path="/register" element={<Navigate to="/citizen/register" replace />} />
      <Route path="/submit-complaint" element={<Navigate to="/citizen/submit" replace />} />
      <Route path="/my-complaints" element={<Navigate to="/citizen/my-complaints" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}