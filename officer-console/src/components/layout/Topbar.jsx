import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MUNICIPAL_ROLES } from '../../mock/officers';
import './Topbar.css';

const ROUTE_TITLES = {
  '/dashboard': 'Operations Dashboard',
  '/complaints': 'Grievance Management',
  '/ai-review': 'AI Review & Triage',
  '/gis-map': 'GIS Geospatial Intelligence',
  '/sla': 'SLA Monitoring & Escalation',
  '/analytics': 'Analytics & AI Evaluation',
  '/audit-logs': 'Audit Trail & Compliance',
  '/settings': 'System & Routing Settings',
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { showInfo, showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPath = location.pathname;
  let pageTitle = ROUTE_TITLES[currentPath] || 'Officer Console';
  if (currentPath.startsWith('/complaints/')) {
    const id = currentPath.split('/')[2];
    pageTitle = `Complaint Details: ${id}`;
  }

  // Sample urgent SLA notifications for municipal operations
  const urgentNotifications = [
    { id: 'notif-1', title: 'SLA Breached: Water supply outage in Ward 12 (72h+)', time: '10m ago', priority: 'Critical' },
    { id: 'notif-2', title: 'High Urgency: Road cave-in near Sinhagad Junction', time: '25m ago', priority: 'High' },
    { id: 'notif-3', title: 'AI Cluster: 38 duplicate complaints grouped in Ward 12', time: '1h ago', priority: 'Medium' },
  ];

  const handleGlobalSearch = e => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await logout();
    showInfo('You have logged out of the Officer Console.', 'Signed Out');
    navigate('/login');
  };

  const handleRoleChange = async roleName => {
    await switchRole(roleName);
    showSuccess(`Switched active officer persona to "${roleName}".`, 'Persona Updated');
    setShowProfileMenu(false);
  };

  return (
    <header className="topbar">
      {/* Left: Breadcrumbs / Title */}
      <div className="topbar__left">
        <div className="topbar__breadcrumbs">
          <span className="topbar__breadcrumb-root">JanSeva AI</span>
          <span className="topbar__breadcrumb-sep">/</span>
          <span className="topbar__breadcrumb-active">{pageTitle}</span>
        </div>
        <h1 className="topbar__title">{pageTitle}</h1>
      </div>

      {/* Center: Global Search */}
      <div className="topbar__center">
        <form onSubmit={handleGlobalSearch} className="topbar__search-form">
          <Search size={16} className="topbar__search-icon" />
          <input
            type="text"
            placeholder="Search complaints, IDs, locations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="topbar__search-input"
          />
        </form>
      </div>

      {/* Right: SLA Warning, Notifications, Officer Profile */}
      <div className="topbar__right">
        {/* SLA Warning Indicator */}
        <div
          className="topbar__sla-pill"
          onClick={() => navigate('/sla')}
          title="Click to inspect SLA Breaches & At-Risk tickets"
        >
          <Clock size={13} className="pulse-indicator" />
          <span className="topbar__sla-text">3 SLA At Risk</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="topbar__dropdown-wrapper" ref={notifRef}>
          <button
            className="topbar__icon-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            title="Notifications & Operational Alerts"
          >
            <Bell size={18} />
            <span className="topbar__badge-count">3</span>
          </button>

          {showNotifications && (
            <div className="topbar__dropdown topbar__dropdown--notifs">
              <div className="topbar__dropdown-header">
                <div>
                  <strong>Operational Alerts</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>
                    Active municipal escalations
                  </div>
                </div>
                <button
                  className="topbar__dropdown-action"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/complaints');
                  }}
                >
                  View All &rarr;
                </button>
              </div>
              <div className="topbar__dropdown-list">
                {urgentNotifications.map(item => (
                  <div
                    key={item.id}
                    className="topbar__notif-item"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/complaints');
                    }}
                  >
                    <div className="topbar__notif-icon">
                      <AlertTriangle
                        size={14}
                        color={item.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)'}
                      />
                    </div>
                    <div className="topbar__notif-content">
                      <div className="topbar__notif-title">{item.title}</div>
                      <div className="topbar__notif-meta">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="topbar__dropdown-wrapper" ref={profileRef}>
          <button
            className="topbar__profile-btn"
            onClick={() => setShowProfileMenu(prev => !prev)}
          >
            <div className="topbar__avatar">{user?.initials || 'OFF'}</div>
            <div className="topbar__user-info">
              <span className="topbar__user-name">{user?.name || 'Officer'}</span>
              <span className="topbar__user-role">{user?.role || 'Municipal Officer'}</span>
            </div>
            <ChevronDown size={14} className="topbar__chevron" />
          </button>

          {showProfileMenu && (
            <div className="topbar__dropdown topbar__dropdown--profile">
              <div className="topbar__dropdown-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>{user?.email}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                    {user?.department}
                  </div>
                </div>
              </div>

              {/* Fast Municipal Persona Switcher for SIH Demonstration */}
              <div className="topbar__role-switcher">
                <span className="topbar__role-label">Switch Officer Persona (Demo):</span>
                <div className="topbar__role-chips">
                  {Object.values(MUNICIPAL_ROLES).map(roleName => (
                    <button
                      key={roleName}
                      className={`topbar__role-chip ${user?.role === roleName ? 'active' : ''}`}
                      onClick={() => handleRoleChange(roleName)}
                    >
                      {roleName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="topbar__dropdown-divider" />

              <button
                className="topbar__dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
              >
                <User size={15} />
                <span>Profile & Settings</span>
              </button>

              <button
                className="topbar__dropdown-item topbar__dropdown-item--danger"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
