import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import AdminSettings from './pages/AdminSettings';
import AttendanceReport from './pages/AttendanceReport';
import OperationsManual from './pages/OperationsManual';

function MainLayout() {
  const { isAuthenticated, initialLoading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [activeModule, setActiveModule] = useState('sales');
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('mirac_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mirac_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (initialLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-muted)',
          fontSize: '15px',
          fontWeight: 600,
        }}
      >
        Initializing Scale-Up CRM...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Render appropriate page view
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigateToLeads={() => setActivePage('leads')} />;
      case 'leads':
      case 'opportunity':
        return (
          <Leads
            newLeadModalOpen={newLeadModalOpen}
            setNewLeadModalOpen={setNewLeadModalOpen}
          />
        );
      case 'admin':
        return <AdminSettings />;
      case 'attendance':
        return <AttendanceReport />;
      case 'daily-report':
      case 'operations':
      case 'admin-report':
        return <OperationsManual />;
      default:
        return <Dashboard onNavigateToLeads={() => setActivePage('leads')} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeModule={activeModule}
          setActiveModule={(mod) => {
            setActiveModule(mod);
            if (mod === 'attendance') setActivePage('attendance');
            else if (mod === 'operations') setActivePage('operations');
            else if (mod === 'sales') setActivePage('dashboard');
            else if (mod === 'reports') setActivePage('daily-report');
          }}
          onOpenNewLead={() => {
            setActivePage('leads');
            setNewLeadModalOpen(true);
          }}
          onOpenKiosk={() => setActivePage('attendance')}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main style={{ flex: 1 }}>{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
