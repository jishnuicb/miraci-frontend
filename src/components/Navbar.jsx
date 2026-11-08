import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, User, LogOut, Shield, Plus, Camera, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeModule, setActiveModule, onOpenNewLead, onOpenKiosk, theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const modules = [
    { id: 'sales', label: 'Sales' },
    { id: 'projects', label: 'Projects' },
    { id: 'reports', label: 'My Reports' },
    { id: 'portal', label: 'Application Portal' },
    { id: 'attendance', label: 'HR & Attendance' },
    { id: 'operations', label: 'Operations SOP' },
  ];

  return (
    <header className="navbar">
      <div className="nav-left">
        <nav className="nav-modules">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`module-tab ${activeModule === m.id ? 'active' : ''}`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="nav-right">
        {/* Search Input */}
        <div className="search-box">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search leads, calls..."
            className="search-input"
          />
        </div>

        {/* Quick Action: New Lead */}
        <button className="btn btn-primary btn-sm" onClick={onOpenNewLead}>
          <Plus size={15} />
          <span>New Lead</span>
        </button>

        {/* Biometric Attendance Quick Punch */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenKiosk}
          title="Face ID Attendance Kiosk"
          style={{ borderColor: 'var(--secondary)', color: 'var(--primary)' }}
        >
          <Camera size={15} />
          <span>Punch Face ID</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={toggleTheme}
          style={{ padding: '8px', borderRadius: '50%' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
              }}
            />
          </button>

          {showNotifications && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700 }}>System Notifications</h4>
                <span style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', padding: '8px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 600 }}>Google Sheet Ingestion</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>14 new student leads synced from Meta Study Abroad Campaign.</p>
                </div>
                <div style={{ fontSize: '12px', padding: '8px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 600 }}>Daily Punch Rule</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Punches before 9:40 AM are marked On-Time. Afternoon rule applies afterwards.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Popover Profile */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #67004f, #b19c81)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.1 }}>{user?.name || 'Staff User'}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {user?.role || 'User'}
              </span>
            </div>
          </div>

          {showUserMenu && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '240px',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700 }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span className="status-pill status-admission" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {user?.employee_code || 'MIRAC-STAFF'}
                  </span>
                  <span className="status-pill status-application" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    Limit: {user?.daily_call_limit || 80}/day
                  </span>
                </div>
              </div>

              <button
                className="sidebar-item"
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenKiosk();
                }}
                style={{ background: 'transparent', color: 'var(--text-main)', border: 'none' }}
              >
                <Camera size={16} />
                <span>Face ID Settings</span>
              </button>

              <button
                className="sidebar-item"
                onClick={logout}
                style={{ background: 'transparent', color: '#ef4444', border: 'none' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
