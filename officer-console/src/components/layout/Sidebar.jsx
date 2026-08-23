import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BrainCircuit,
  MapPin,
  AlertTriangle,
  BarChart3,
  History,
  Settings as SettingsIcon,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Sidebar.css';

const OPERATIONS_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/ai-review', label: 'AI Review', icon: BrainCircuit, badge: 'XAI' },
  { to: '/gis-map', label: 'GIS Intelligence', icon: MapPin },
  { to: '/sla', label: 'SLA & Escalation', icon: AlertTriangle, badge: 'SLA', badgeVariant: 'critical' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/audit-logs', label: 'Audit Logs', icon: History },
];

const SYSTEM_NAV = [
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showInfo } = useToast();

  const handleSignOut = async () => {
    await logout();
    showInfo('Logged out of Officer Console.', 'Signed Out');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <Building2 size={22} strokeWidth={2.4} />
        </div>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-title">JANSEVA AI</span>
            <span className="sidebar__brand-subtitle">Officer Console</span>
          </div>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="sidebar__collapse-btn"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {/* OPERATIONS SECTION */}
        <div className="sidebar__section-label">{!collapsed && 'OPERATIONS'}</div>
        {OPERATIONS_NAV.map(({ to, label, icon: Icon, badge, badgeVariant }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={2} className="sidebar__link-icon" />
            {!collapsed && <span className="sidebar__link-text">{label}</span>}
            {!collapsed && badge && (
              <span className={`sidebar__badge ${badgeVariant === 'critical' ? 'sidebar__badge--critical' : ''}`}>
                {badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* SYSTEM SECTION */}
        <div className="sidebar__divider" />
        <div className="sidebar__section-label">{!collapsed && 'SYSTEM'}</div>
        {SYSTEM_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={2} className="sidebar__link-icon" />
            {!collapsed && <span className="sidebar__link-text">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Officer Profile & Sign Out Footer */}
      <div className="sidebar__footer">
        {!collapsed ? (
          <div className="sidebar__footer-content">
            <div className="sidebar__footer-user">
              <div className="sidebar__footer-avatar">{user?.initials || 'OFF'}</div>
              <div className="sidebar__footer-details">
                <span className="sidebar__footer-name">{user?.name || 'Officer'}</span>
                <span className="sidebar__footer-role">{user?.role || 'Municipal Officer'}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="sidebar__footer-signout"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="sidebar__footer-signout"
            title="Sign Out"
            style={{ margin: '0 auto' }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
