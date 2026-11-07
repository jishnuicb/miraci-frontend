import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  Clock,
  FileSpreadsheet,
  BarChart3,
  CheckSquare,
  PhoneCall,
  Building2,
  FileCheck2,
  ListTodo,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'leads', label: 'Lead', icon: Users, badge: '25' },
    { id: 'opportunity', label: 'Opportunity', icon: Briefcase },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'attendance', label: 'HR & Attendance', icon: Clock },
    { id: 'daily-report', label: 'Daily Report', icon: FileSpreadsheet },
    { id: 'admin-report', label: 'Admin-Report', icon: BarChart3 },
    { id: 'operations', label: 'Operations SOP', icon: CheckSquare, badge: 'Mirac' },
    { id: 'call-recordings', label: 'Call Recordings', icon: PhoneCall },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'sales-order', label: 'Sales Order', icon: FileCheck2 },
    { id: 'todo', label: 'To-do List', icon: ListTodo },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GraduationCap size={22} color="#ffffff" />
        </div>
        <div className="brand-title">
          <span>Scale-Up CRM</span>
          <span className="brand-subtitle">Mirac International</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(56, 189, 248, 0.2)',
                    color: isActive ? '#fff' : '#38bdf8',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="sidebar-footer">
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '10px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} color="#10b981" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
              Learn With Fahad
            </span>
            <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>
              Scale-Up CRM v2.6 Enterprise
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
