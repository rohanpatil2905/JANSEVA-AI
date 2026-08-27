import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ToastContainer, { showToast } from '../common/Toast';
import { slaAPI } from '../../services/api';
import {
  FaChartPie,
  FaClipboardList,
  FaLayerGroup,
  FaMapMarkedAlt,
  FaBrain,
  FaClock,
  FaUserCheck,
  FaChartLine,
  FaBell,
  FaHistory,
  FaSignOutAlt,
  FaBolt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaChevronRight,
} from 'react-icons/fa';

export default function OfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runningSweep, setRunningSweep] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/officer/login');
  };

  const handleRunEscalationSweep = async () => {
    setRunningSweep(true);
    try {
      const data = await slaAPI.checkEscalations();
      showToast(`Escalation sweep executed! ${data.escalated_count} complaints processed.`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to run escalation sweep', 'error');
    } finally {
      setRunningSweep(false);
    }
  };

  // The 10 Clearly Visible Required Officer Tools
  const officerTools = [
    { to: '/officer/dashboard', label: 'Dashboard', icon: <FaChartPie />, badge: null },
    { to: '/officer/complaints', label: 'Complaints', icon: <FaClipboardList />, badge: null },
    { to: '/officer/master-issues', label: 'Master Issues', icon: <FaLayerGroup />, badge: null },
    { to: '/officer/gis', label: 'GIS / Hotspots', icon: <FaMapMarkedAlt />, badge: 'GIS' },
    { to: '/officer/ai-insights', label: 'AI Insights', icon: <FaBrain />, badge: 'AI' },
    { to: '/officer/sla', label: 'SLA & Escalations', icon: <FaClock />, badge: 'Live' },
    { to: '/officer/reviews', label: 'Review Queue', icon: <FaUserCheck />, badge: 'HITL' },
    { to: '/officer/analytics', label: 'Analytics', icon: <FaChartLine />, badge: null },
    { to: '/officer/notifications', label: 'Notifications', icon: <FaBell />, badge: 'Alerts' },
    { to: '/officer/audit', label: 'Audit / Timeline', icon: <FaHistory />, badge: null },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '260px' : '78px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          borderRight: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            borderBottom: '1px solid #1e293b',
          }}
        >
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--emerald-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                JS
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Officer Desk</strong>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Municipal Operations</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '6px',
              display: 'flex',
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* User Identity Pill */}
        {sidebarOpen && user && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#1e293b',
              margin: '12px 12px 6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--saffron-400)' }}>
                {user.role === 'admin' ? 'Super Admin' : 'Municipal Officer'}
              </div>
            </div>
          </div>
        )}

        {/* 10 Required Tools Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              padding: '8px 12px',
              letterSpacing: '0.05em',
            }}
          >
            {sidebarOpen ? 'Command Center Tools' : 'Tools'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {officerTools.map((tool) => (
              <NavLink
                key={tool.to}
                to={tool.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 110, 230, 0.35)' : 'none',
                })}
                title={!sidebarOpen ? tool.label : undefined}
              >
                <span style={{ fontSize: '1.05rem', display: 'flex', flexShrink: 0 }}>
                  {tool.icon}
                </span>

                {sidebarOpen && (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{tool.label}</span>
                    {tool.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          fontWeight: 700,
                        }}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Quick Action: Trigger SLA Sweep */}
        {sidebarOpen && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid #1e293b' }}>
            <button
              onClick={handleRunEscalationSweep}
              disabled={runningSweep}
              className="btn btn-accent btn-sm"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.8rem',
              }}
              title="Runs the automatic SLA escalation check sweep immediately"
            >
              <FaBolt className={runningSweep ? 'animate-spin' : ''} />
              <span>{runningSweep ? 'Sweeping...' : 'Run SLA Sweep'}</span>
            </button>
          </div>
        )}

        {/* Sidebar Footer / Logout */}
        <div
          style={{
            padding: '14px 12px',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
          }}
        >
          {sidebarOpen ? (
            <>
              <button
                onClick={() => navigate('/citizen/dashboard')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Citizen View <FaChevronRight style={{ fontSize: '0.65rem' }} />
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
                title="Logout of Officer Desk"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </aside>

      {/* Main Officer Content Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Officer Top Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-800)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FaShieldAlt style={{ color: 'var(--primary-600)' }} /> Municipal Officer Console
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Connected to PostgreSQL API
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <NavLink
              to="/officer/notifications"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                position: 'relative',
              }}
              title="View Alerts"
            >
              <FaBell />
            </NavLink>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {user?.email}
            </div>
          </div>
        </header>

        {/* Dynamic Tool Page Content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
