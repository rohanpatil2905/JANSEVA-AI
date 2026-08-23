import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Sliders,
  Info,
  Lock,
  Save,
  Building2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MUNICIPAL_ROLES, officers } from '../mock/officers';
import { getSavedPreferences, savePreferences } from '../services/authService';

export default function Settings() {
  const { user, switchRole, session } = useAuth();
  const { showSuccess, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Preferences State
  const [prefs, setPrefs] = useState(() => getSavedPreferences());

  const handlePrefToggle = key => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      savePreferences(updated);
      return updated;
    });
    showSuccess('Operational preference updated and persisted.', 'Setting Saved');
  };

  const handlePrefChange = (key, val) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: val };
      savePreferences(updated);
      return updated;
    });
  };

  const handleSaveForm = e => {
    e.preventDefault();
    savePreferences(prefs);
    showSuccess('Officer preferences successfully saved to local session.', 'Preferences Saved');
  };

  const handleRoleSwitch = async roleName => {
    await switchRole(roleName);
    showSuccess(`Active officer persona switched to "${roleName}".`, 'Persona Updated');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'authority', label: 'Role & Authority', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'operational', label: 'Operational Preferences', icon: Sliders },
    { id: 'system', label: 'System Info', icon: Info },
    { id: 'security', label: 'Security & Audit', icon: Lock },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        paddingBottom: '40px',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          JanSeva AI / Settings
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em' }}>
          Officer Console Settings & Governance
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
          Manage authenticated officer identity, statutory permissions, alert thresholds, and system integration status.
        </p>
      </div>

      {/* Tabs Navigation Strip */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                border: 'none',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 800 : 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.1s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OFFICER PROFILE */}
      {activeTab === 'profile' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Municipal Officer Profile
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Statutory credentials and jurisdictional assignment details
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Officer Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || 'Rohan Patil'}
                style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: 'var(--color-surface-sunken)', fontWeight: 700, color: 'var(--color-ink)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Officer Identification ID
              </label>
              <input
                type="text"
                disabled
                value={user?.id || 'OFF-WARD-12'}
                className="mono"
                style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: 'var(--color-surface-sunken)', fontWeight: 800, color: 'var(--color-primary)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Municipal Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || 'rohan.patil@gov.in'}
                style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: 'var(--color-surface-sunken)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Assigned Municipal Role
              </label>
              <input
                type="text"
                disabled
                value={user?.role || 'Zonal Ward Officer'}
                style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: 'var(--color-surface-sunken)', fontWeight: 700, color: 'var(--color-primary)' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Department
              </label>
              <input
                type="text"
                disabled
                value={user?.department || 'Municipal Zonal Administration'}
                style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: 'var(--color-surface-sunken)' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Jurisdiction & Assigned Wards
              </label>
              <input
                type="text"
                disabled
                value={user?.jurisdiction || 'Ward 12 – Hadapsar & Swargate Zone'}
                style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: 'var(--color-surface-sunken)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE & AUTHORITY */}
      {activeTab === 'authority' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Statutory Authority & Permitted Operations
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Role-based access privileges authorized for this officer workstation
            </p>
          </div>

          {/* Authority Banner */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-tint)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Current Authority Level
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
                {user?.authorityLevel || 'Level 2 — Zonal Ward Executive'}
              </div>
            </div>

            <span
              style={{
                padding: '3px 10px',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-healthy)',
                border: '1px solid var(--color-healthy-border)',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              Account Active & Verified
            </span>
          </div>

          {/* Permitted Operations Grid */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-ink)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Permitted Operations Matrix ({user?.permissions?.length || 15} Authorized)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
              {(user?.permissions || []).map(perm => (
                <div
                  key={perm}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--color-surface-sunken)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                  }}
                >
                  <CheckCircle2 size={13} color="var(--color-healthy)" style={{ flexShrink: 0 }} />
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Persona Switcher */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Prototype Persona Switcher (Demo Environment)
              </span>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', margin: '2px 0 0' }}>
                Backend RBAC will supersede this during production integration. Switch personas to verify differential role views.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {officers.map(off => {
                const isSelected = user?.role === off.role;

                return (
                  <button
                    key={off.id}
                    type="button"
                    onClick={() => handleRoleSwitch(off.role)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-tint)' : '#FFFFFF',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <strong style={{ fontSize: '0.78125rem' }}>{off.name}</strong>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>{off.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <form
          onSubmit={handleSaveForm}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Alert & Notification Preferences
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Configure operational trigger alarms for emergency grievances, SLA risks, and AI recommendations
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. Critical */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-ink)' }}>
                  Critical Priority Incident Alarms (Severity &gt; 90)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Immediate audio-visual alert when life-safety or massive infrastructure outages are logged
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifCriticalAlerts ?? true}
                onChange={() => handlePrefToggle('notifCriticalAlerts')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 2. SLA Breach */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-ink)' }}>
                  SLA Deadline Approaching & Breach Warnings (&lt; 4 Hours)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Highlight countdown pressure in topbar and SLA Command Center
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifSlaBreaches ?? true}
                onChange={() => handlePrefToggle('notifSlaBreaches')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 3. AI Triage */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-ink)' }}>
                  AI Review Queue Triage Notifications
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Alert when low-confidence or high-severity tickets enter the AI Review Workbench
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifAiTriaged ?? true}
                onChange={() => handlePrefToggle('notifAiTriaged')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 4. Escalations */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-ink)' }}>
                  Administrative Escalation Alerts (Level 2 & 3)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Notify when a subordinate officer escalates an unresolved grievance
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifEscalations ?? true}
                onChange={() => handlePrefToggle('notifEscalations')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 5. Citizen Confirmation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-ink)' }}>
                  Citizen Confirmation / Reopen Telemetry
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Alert when a citizen confirms resolution satisfaction or requests ticket reopening
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifCitizenConfirmations ?? true}
                onChange={() => handlePrefToggle('notifCitizenConfirmations')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: OPERATIONAL PREFERENCES */}
      {activeTab === 'operational' && (
        <form
          onSubmit={handleSaveForm}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Operational Workspace Preferences
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Customize table views, default filters, and AI inference confidence thresholds
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                Default Grievance Registry View
              </label>
              <select
                value={prefs.defaultView || 'All'}
                onChange={e => handlePrefChange('defaultView', e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.8125rem', backgroundColor: 'var(--color-surface-sunken)' }}
              >
                <option value="All">All Grievances</option>
                <option value="Critical">Critical Priority Focus</option>
                <option value="AtRisk">SLA At-Risk Queue</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                Table Layout Density
              </label>
              <select
                value={prefs.tableDensity || 'Comfortable'}
                onChange={e => handlePrefChange('tableDensity', e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.8125rem', backgroundColor: 'var(--color-surface-sunken)' }}
              >
                <option value="Comfortable">Comfortable (Standard)</option>
                <option value="Compact">Compact (Dense Data View)</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                AI Confidence Flag Threshold: <strong>{prefs.aiConfidenceThreshold || 85}%</strong>
              </label>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginBottom: '8px' }}>
                Complaints with model confidence below this threshold are automatically routed to the AI Review Workbench for human verification.
              </p>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={prefs.aiConfidenceThreshold || 85}
                onChange={e => handlePrefChange('aiConfidenceThreshold', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              height: '38px',
              padding: '0 18px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            <Save size={14} /> Save Preferences
          </button>
        </form>
      )}

      {/* TAB 5: SYSTEM INFORMATION */}
      {activeTab === 'system' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              System & Architecture Information
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              JanSeva AI platform specifications and prototype integration environment
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              fontSize: '0.78125rem',
            }}
          >
            <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Platform Version</div>
              <div style={{ fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>JanSeva AI v2.4.0-SIH2026</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Deployment Environment</div>
              <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>PMC Prototype Node (Localhost)</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Data Source</div>
              <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>Authoritative Municipal Dataset (20 Cases)</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Backend Integration Status</div>
              <div style={{ fontWeight: 800, color: 'var(--color-high)', marginTop: '2px' }}>Service Abstraction Ready (Pending REST)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & AUDIT */}
      {activeTab === 'security' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Workstation Security & Session Integrity
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Active authenticated session properties and audit retention parameters
            </p>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.78125rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Session Authentication State:</span>
              <strong style={{ color: 'var(--color-healthy)' }}>Authenticated & Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Prototype Session Key:</span>
              <span className="mono">{session?.token ? `${session.token.slice(0, 24)}...` : 'session-active'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Audit Trail Ledger:</span>
              <strong style={{ color: 'var(--color-primary)' }}>Append-Only Enabled</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Storage Persistence:</span>
              <span>sessionStorage (Encapsulated)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Production Auth Status:</span>
              <span style={{ color: 'var(--color-high)', fontWeight: 700 }}>Ready for Backend API Contract</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
