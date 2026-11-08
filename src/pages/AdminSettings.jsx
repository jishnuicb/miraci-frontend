import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Sliders,
  Layout,
  TableProperties,
  Building,
  RefreshCw,
  UserPlus,
  Trash2,
  Check,
  X,
  Scan,
  Mail,
  KeyRound,
  FileCheck,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles', 'staff', 'lead-settings', 'form-builder', 'columns', 'company', 'sync', 'assignment'
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Roles & Claims state
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    code: '',
    description: '',
    template: 'counsellor',
  });

  // 2. Staff state
  const [staffList, setStaffList] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: 'password123',
    role_id: 1,
    designation: 'Educational Counsellor',
    department: 'Counseling',
    daily_call_limit: 80,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  // 3. Lead Settings state
  const [leadSettingsType, setLeadSettingsType] = useState('sources');
  const [leadSettings, setLeadSettings] = useState({});
  const [newSettingName, setNewSettingName] = useState('');

  // 4. Form Builder state
  const [formFields, setFormFields] = useState([]);

  // 5. Column Customization state
  const [columns, setColumns] = useState([]);

  // 6. Company Profile state
  const [companyProfile, setCompanyProfile] = useState({
    company_name: 'Mirac International Educational Services',
    trade_name: 'Mirac International',
    partner_firm: 'Mirac International Global',
    registration_number: 'KL-CLT-2024-ED8942',
    email: 'info@miracinternational.com',
    phone: '+91 9847098765',
    website: 'https://miracinternational.com',
    address_line_1: '2nd Floor, HiLite Business Park, Poovangal',
    city: 'Kozhikode',
    state: 'Kerala',
    country: 'India',
    postal_code: '673014',
    currency_code: 'INR',
    tax_id: 'GSTIN32AAEFM9012F1Z4',
  });

  // 7. Auto Assignment Rules state
  const [autoAssignments, setAutoAssignments] = useState([]);

  // 8. Google Sheet Syncs state
  const [sheetSyncs, setSheetSyncs] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rRes, sRes, lsRes, fbRes, colRes, cpRes, aaRes, ssRes] = await Promise.all([
        api.admin.getRoles(),
        api.admin.getStaff(),
        api.admin.getLeadSettings(),
        api.admin.getFormLayout(),
        api.admin.getColumnCustomization(),
        api.admin.getCompanyProfile(),
        api.admin.getAutoAssignments(),
        api.admin.getGoogleSheetSyncs(),
      ]);

      if (rRes.roles) {
        setRoles(rRes.roles);
        setSelectedRole(rRes.roles[0]);
      }
      if (sRes.staff) setStaffList(sRes.staff);
      if (lsRes.settings) setLeadSettings(lsRes.settings);
      if (fbRes.fields) setFormFields(fbRes.fields);
      if (colRes.columns) setColumns(colRes.columns);
      if (cpRes.profile) setCompanyProfile(cpRes.profile);
      if (aaRes.rules) setAutoAssignments(aaRes.rules);
      if (ssRes.syncs) setSheetSyncs(ssRes.syncs);
    } catch (err) {
      console.warn('Error fetching admin settings', err);
    } finally {
      setLoading(false);
    }
  };

  // Update Role Permissions
  const handleTogglePermission = (moduleKey, permKey) => {
    if (!selectedRole) return;
    const currentPerms = { ...(selectedRole.permissions || {}) };
    if (!currentPerms[moduleKey]) currentPerms[moduleKey] = {};

    currentPerms[moduleKey][permKey] = !currentPerms[moduleKey][permKey];

    const updatedRole = { ...selectedRole, permissions: currentPerms };
    setSelectedRole(updatedRole);
    setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      await api.admin.updateRolePermissions(selectedRole.id, selectedRole.permissions);
      setStatusMsg(`Permissions saved for ${selectedRole.name}!`);
      setTimeout(() => setStatusMsg(''), 3000);
      confetti({ particleCount: 40, spread: 50 });
    } catch (err) {
      alert('Failed to save permissions');
    }
  };

  // Create Custom Role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    try {
      let initialPermissions = {
        lead: { lead_list: true, create: true, edit: true, delete: false, view: true },
        opportunity: { lead_list: true, create: false, edit: false, delete: false, view: true },
        appreciation_wall: { lead_list: false, create: false, edit: false, delete: false, view: true },
        hr_view: { lead_list: false, create: false, edit: false, delete: false, view: false },
        applications: { lead_list: true, create: false, edit: false, delete: false, view: true },
        tele_caller: { lead_list: true, create: true, edit: true, delete: false, view: true },
      };

      if (newRole.template === 'admin') {
        initialPermissions = {
          lead: { lead_list: true, create: true, edit: true, delete: true, view: true },
          opportunity: { lead_list: true, create: true, edit: true, delete: true, view: true },
          appreciation_wall: { lead_list: true, create: true, edit: true, delete: true, view: true },
          hr_view: { lead_list: true, create: true, edit: true, delete: true, view: true },
          applications: { lead_list: true, create: true, edit: true, delete: true, view: true },
          tele_caller: { lead_list: true, create: true, edit: true, delete: true, view: true },
        };
      } else if (newRole.template === 'readonly') {
        initialPermissions = {
          lead: { lead_list: true, create: false, edit: false, delete: false, view: true },
          opportunity: { lead_list: true, create: false, edit: false, delete: false, view: true },
          appreciation_wall: { lead_list: true, create: false, edit: false, delete: false, view: true },
          hr_view: { lead_list: false, create: false, edit: false, delete: false, view: true },
          applications: { lead_list: true, create: false, edit: false, delete: false, view: true },
          tele_caller: { lead_list: true, create: false, edit: false, delete: false, view: true },
        };
      }

      const res = await api.admin.createRole({
        name: newRole.name.trim(),
        code: newRole.code.trim() || undefined,
        description: newRole.description.trim() || undefined,
        permissions: initialPermissions,
      });

      if (res.success && res.role) {
        const updatedRoles = [...roles, res.role];
        setRoles(updatedRoles);
        setSelectedRole(res.role);
        setShowCreateRoleModal(false);
        setNewRole({ name: '', code: '', description: '', template: 'counsellor' });
        confetti({ particleCount: 50, spread: 60 });
        setStatusMsg(`Role '${res.role.name}' created successfully!`);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to create role');
    }
  };

  // Delete Custom Role
  const handleDeleteRole = async (e, role) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete role '${role.name}'?`)) return;

    try {
      const res = await api.admin.deleteRole(role.id);
      if (res.success) {
        const remaining = roles.filter((r) => r.id !== role.id);
        setRoles(remaining);
        if (selectedRole?.id === role.id && remaining.length > 0) {
          setSelectedRole(remaining[0]);
        }
        setStatusMsg(res.message);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete role');
    }
  };

  // SaaS OTP Flow (Page 8)
  const handleSendOtp = async () => {
    if (!newStaff.email) {
      alert('Please enter staff email address first');
      return;
    }
    try {
      const res = await api.auth.sendOtp(newStaff.email);
      if (res.success) {
        setOtpSent(true);
        setDemoOtp(res.demo_otp);
        alert(`SaaS Verification OTP sent! (Demo OTP: ${res.demo_otp})`);
      }
    } catch (err) {
      alert('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.auth.verifyOtp(newStaff.email, enteredOtp);
      if (res.success) {
        setEmailVerified(true);
        alert('Email verified successfully! You may now create the staff profile.');
      }
    } catch (err) {
      alert(err.message || 'Invalid OTP code');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admin.createStaff(newStaff);
      if (res.success) {
        setShowAddStaffModal(false);
        loadAllData();
        confetti({ particleCount: 50, spread: 60 });
        alert('Staff created successfully!');
      }
    } catch (err) {
      alert(err.message || 'Error creating staff');
    }
  };

  // Trigger Google Sheet Sync (Training Page 8)
  const handleTriggerSync = async (id) => {
    try {
      const res = await api.admin.triggerGoogleSheetSync(id);
      if (res.success) {
        loadAllData();
        confetti({ particleCount: 60, spread: 70 });
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Sync failed');
    }
  };

  // Save Company Profile
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      await api.admin.updateCompanyProfile(companyProfile);
      alert('Company Profile saved successfully!');
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      alert('Failed to save company profile');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Admin Configuration</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Enterprise System Control Panel (Roles, Staff, SaaS OTP, Forms, Columns & Sync)
        </p>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            color: '#10b981',
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Admin Tabs Bar */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          overflowX: 'auto',
          gap: '6px',
        }}
      >
        {[
          { id: 'roles', label: 'Roles & Claims (Page 6)', icon: Shield },
          { id: 'staff', label: 'Staff & SaaS OTP (Page 7-8)', icon: Users },
          { id: 'lead-settings', label: 'Lead Settings (Page 9)', icon: Sliders },
          { id: 'form-builder', label: 'Form Layout (Page 12)', icon: Layout },
          { id: 'columns', label: 'Column Preferences (Page 15)', icon: TableProperties },
          { id: 'company', label: 'Company Profile (Page 16)', icon: Building },
          { id: 'sync', label: 'Google Sheet Sync (Page 11)', icon: RefreshCw },
          { id: 'assignment', label: 'Auto Assignment (Page 10)', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`module-tab ${isActive ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: ROLES & CLAIMS (Page 6) ==================== */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '24px' }}>
          {/* Roles List */}
          <div className="analytics-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  Roles ({roles.length})
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mirac International hierarchy</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                onClick={() => setShowCreateRoleModal(true)}
              >
                <Plus size={14} />
                <span>+ Create Role</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: selectedRole?.id === r.id ? 'var(--primary-light)' : 'transparent',
                    border: selectedRole?.id === r.id ? '1px solid var(--primary-border)' : '1px solid transparent',
                    color: selectedRole?.id === r.id ? 'var(--primary)' : 'inherit',
                    fontWeight: selectedRole?.id === r.id ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{r.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {r.code || 'CUSTOM'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {r.users_count || 0} users
                    </span>
                    {!['SUPER_ADMIN', 'CEO', 'MANAGING_DIRECTOR'].includes(r.code) && (
                      <button
                        title="Delete Custom Role"
                        onClick={(e) => handleDeleteRole(e, r)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Claims Matrix for Selected Role */}
          <div className="analytics-card">
            <div className="card-header">
              <div>
                <span className="card-title">
                  <Shield size={18} color="var(--primary)" />
                  Permission Matrix: {selectedRole?.name}
                  {selectedRole?.description && (
                    <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({selectedRole.description})
                    </span>
                  )}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Configure granular CRUD claims as per Mirac International Architecture
                </p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleSaveRolePermissions}>
                <Save size={14} />
                <span>Save Permissions</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Module Name</th>
                    <th style={{ textAlign: 'center' }}>Lead List</th>
                    <th style={{ textAlign: 'center' }}>Create</th>
                    <th style={{ textAlign: 'center' }}>Edit</th>
                    <th style={{ textAlign: 'center' }}>Delete</th>
                    <th style={{ textAlign: 'center' }}>View</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'lead', label: 'Lead' },
                    { key: 'opportunity', label: 'Opportunity' },
                    { key: 'appreciation_wall', label: 'Appreciation Wall' },
                    { key: 'hr_view', label: 'HR View' },
                    { key: 'applications', label: 'Applications' },
                    { key: 'tele_caller', label: 'Tele Caller' },
                  ].map((mod) => {
                    const claims = selectedRole?.permissions?.[mod.key] || {};

                    return (
                      <tr key={mod.key}>
                        <td style={{ fontWeight: 700 }}>{mod.label}</td>
                        {['lead_list', 'create', 'edit', 'delete', 'view'].map((action) => (
                          <td key={action} style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!claims[action]}
                              onChange={() => handleTogglePermission(mod.key, action)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: STAFF & SAAS OTP (Page 7-8) ==================== */}
      {activeTab === 'staff' && (
        <div className="data-table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Staff Members & Biometric Enrollment</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Mirac International active personnel with SaaS OTP verification & daily call caps
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddStaffModal(true);
                setOtpSent(false);
                setEmailVerified(false);
              }}
            >
              <UserPlus size={16} />
              <span>+ Add Staff Member</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Staff Name & Username</th>
                  <th>Email & Phone</th>
                  <th>Designation & Dept</th>
                  <th>Role</th>
                  <th>Daily Call Limit</th>
                  <th>Face ID Biometric</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: '12px' }}>
                        {s.employee_code || `MIRAC-00${s.id}`}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #67004f, #b19c81)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}
                        >
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{s.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{s.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{s.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.phone || '—'}</div>
                    </td>
                    <td>
                      <div>{s.designation || 'Staff'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.department || 'Counseling'}</div>
                    </td>
                    <td>
                      <span className="status-pill status-application">
                        {s.role || s.user_role?.name || 'Staff'}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-admission">
                        {s.daily_call_limit || 80} calls/day
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={{
                          background: s.face_enrolled_at ? '#dcfce7' : '#fef3c7',
                          color: s.face_enrolled_at ? '#15803d' : '#b45309',
                        }}
                      >
                        {s.face_enrolled_at ? 'Enrolled' : 'Ready (Demo Active)'}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-admission">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: LEAD SETTINGS (Page 9) ==================== */}
      {activeTab === 'lead-settings' && (
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={18} color="var(--primary)" />
              Lead Configuration Metadata
            </span>
          </div>

          {/* Sub-tabs: Sources, Stages, Tags, Requirements, Batches, Follow-up actions, Lost reasons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'sources', label: 'Sources' },
              { id: 'stages', label: 'Stages' },
              { id: 'tags', label: 'Tags' },
              { id: 'requirements', label: 'Requirements' },
              { id: 'batches', label: 'Batches' },
              { id: 'follow_up_actions', label: 'Follow-up Actions' },
              { id: 'lost_reasons', label: 'Lost Reasons' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setLeadSettingsType(sub.id)}
                className={`pill-btn ${leadSettingsType === sub.id ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder={`Add new ${leadSettingsType.replace('_', ' ')}...`}
                value={newSettingName}
                onChange={(e) => setNewSettingName(e.target.value)}
                className="form-input"
                style={{ maxWidth: '320px' }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  if (!newSettingName) return;
                  await api.admin.createLeadSetting({ type: leadSettingsType, name: newSettingName });
                  setNewSettingName('');
                  loadAllData();
                }}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
              {(leadSettings[leadSettingsType] || []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color || '#3b82f6' }} />
                  <span>{item.name}</span>
                  <button
                    onClick={async () => {
                      await api.admin.deleteLeadSetting(item.id);
                      loadAllData();
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: FORM BUILDER (Page 12) ==================== */}
      {activeTab === 'form-builder' && (
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <span className="card-title">
                <Layout size={18} color="var(--primary)" />
                Dynamic Lead Form Layout Builder (Page 12)
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Drag and drop or assign fields between sections: Unarranged Fields & 3 Structured Sections
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                await api.admin.updateFormLayout(formFields);
                alert('Form layout saved successfully!');
              }}
            >
              <Save size={14} />
              <span>Save Layout</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {['section_1', 'section_2', 'section_3'].map((secKey, sIdx) => {
              const secTitles = [
                'Section 1: Basic Information',
                'Section 2: Course & Academic Interest',
                'Section 3: Revenue & Additional Info',
              ];

              const secFields = formFields.filter((f) => f.section === secKey);

              return (
                <div
                  key={secKey}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>
                    {secTitles[sIdx]}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {secFields.map((field) => (
                      <div
                        key={field.id}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12.5px',
                        }}
                      >
                        <div>
                          <strong>{field.field_label}</strong>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {field.field_type} {field.is_required ? '(Required)' : ''}
                          </div>
                        </div>

                        <select
                          value={field.section}
                          onChange={(e) => {
                            const newSec = e.target.value;
                            setFormFields(
                              formFields.map((f) => (f.id === field.id ? { ...f, section: newSec } : f))
                            );
                          }}
                          className="form-select"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <option value="section_1">Section 1</option>
                          <option value="section_2">Section 2</option>
                          <option value="section_3">Section 3</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: COLUMN CUSTOMIZATION (Page 15) ==================== */}
      {activeTab === 'columns' && (
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <span className="card-title">
                <TableProperties size={18} color="var(--primary)" />
                Lead List Column Customization (Page 15)
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Enable or disable visibility of table columns for counsellors and managers
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                await api.admin.updateColumnCustomization(columns);
                alert('Column preferences saved!');
              }}
            >
              <Save size={14} />
              <span>Save Preferences</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {columns.map((col, idx) => (
              <label
                key={col.column_key || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={col.is_visible}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setColumns(
                      columns.map((c) => (c.column_key === col.column_key ? { ...c, is_visible: checked } : c))
                    );
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>{col.column_label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 6: COMPANY PROFILE (Page 16) ==================== */}
      {activeTab === 'company' && (
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <Building size={18} color="var(--primary)" />
              Company Information (Page 16)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '16px 20px',
              background: 'var(--bg-app)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                padding: '10px 18px',
                background: '#ffffff',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/mirac-logo-web.png"
                alt="Mirac International"
                style={{ height: '46px', maxWidth: '200px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/mirac-logo.png';
                }}
              />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Official Brand Identity: Mirac International
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Colors: Deep Plum (#67004f) & Warm Sand Gold (#b19c81)
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyProfile.company_name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, company_name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trade Name</label>
                <input
                  type="text"
                  value={companyProfile.trade_name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, trade_name: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Partner Organization</label>
                <input
                  type="text"
                  value={companyProfile.partner_firm}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, partner_firm: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registration / License Number</label>
                <input
                  type="text"
                  value={companyProfile.registration_number}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, registration_number: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  value={companyProfile.email}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={companyProfile.phone}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax ID / GSTIN</label>
                <input
                  type="text"
                  value={companyProfile.tax_id}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, tax_id: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Registered Office Address</label>
              <input
                type="text"
                value={companyProfile.address_line_1}
                onChange={(e) => setCompanyProfile({ ...companyProfile, address_line_1: e.target.value })}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Save size={15} />
              <span>Save Company Profile</span>
            </button>
          </form>
        </div>
      )}

      {/* ==================== TAB 7: GOOGLE SHEET & META SYNC (Page 11) ==================== */}
      {activeTab === 'sync' && (
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <span className="card-title">
                <RefreshCw size={18} color="var(--primary)" />
                Automatic Google Sheet & Meta Ingestion Sync (Page 11)
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time automatic lead capture from Google Sheets and Meta Webhooks
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sheetSyncs.map((sync) => (
              <div
                key={sync.id}
                style={{
                  padding: '18px',
                  background: 'var(--bg-app)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{sync.sync_name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Sheet ID: <code>{sync.sheet_id}</code> | Strategy: <strong>{sync.distribution_strategy}</strong>
                  </p>
                  <p style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                    Status: {sync.status_message} | Synced Rows: <strong>{sync.synced_rows_count}</strong>
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleTriggerSync(sync.id)}
                >
                  <RefreshCw size={14} />
                  <span>Sync Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 8: AUTO ASSIGNMENT & DAILY CALL LIMIT (Page 10) ==================== */}
      {activeTab === 'assignment' && (
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <span className="card-title">
                <FileCheck size={18} color="var(--primary)" />
                Auto Lead Assignment & Staff Call Cap Rules (Page 10)
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Automated lead dispatching engine with daily counselor call limit enforcement
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {autoAssignments.map((rule) => (
              <div
                key={rule.id}
                style={{
                  padding: '18px',
                  background: 'var(--bg-app)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{rule.rule_name}</h4>
                  <span className="status-pill status-admission">
                    {rule.distribution_type}
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Default Counselor Call Limit: <strong>{rule.default_call_limit} calls/day</strong>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    checked={rule.daily_call_limit_enforced}
                    onChange={async (e) => {
                      const enforced = e.target.checked;
                      await api.admin.updateAutoAssignment(rule.id, { daily_call_limit_enforced: enforced });
                      loadAllData();
                    }}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Strictly enforce 80 calls/day threshold before redirecting to next available counsellor
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ADD STAFF MODAL WITH SAAS OTP (Page 8) ==================== */}
      {showAddStaffModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Add New Staff Member</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Requires SaaS Email OTP Verification & Biometric Enrollment (Page 8)
                </p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anju Kurian"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. anju"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Email with SaaS OTP Verification (Page 8) */}
                <div className="form-group">
                  <label className="form-label">Official Email Address *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      required
                      placeholder="staff@miracinternational.com"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleSendOtp}
                    >
                      <Mail size={14} />
                      <span>Send OTP</span>
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div
                    style={{
                      background: 'var(--bg-app)',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <KeyRound size={18} color="var(--primary)" />
                    <input
                      type="text"
                      placeholder={`Enter OTP code (${demoOtp})`}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="form-input"
                      style={{ width: '180px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleVerifyOtp}
                    >
                      Verify
                    </button>
                    {emailVerified && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>✅ Verified</span>}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      value={newStaff.role_id}
                      onChange={(e) => setNewStaff({ ...newStaff, role_id: parseInt(e.target.value) })}
                      className="form-select"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Daily Call Cap (Target)</label>
                    <input
                      type="number"
                      value={newStaff.daily_call_limit}
                      onChange={(e) => setNewStaff({ ...newStaff, daily_call_limit: parseInt(e.target.value) || 80 })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      value={newStaff.designation}
                      onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Temporary Password</label>
                    <input
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CREATE ROLE MODAL ==================== */}
      {showCreateRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Create New Role</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Define custom role title, access permissions & organizational claims
                </p>
              </div>
              <button
                className="btn-icon"
                onClick={() => setShowCreateRoleModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Branch Operations Manager"
                    value={newRole.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewRole({
                        ...newRole,
                        name,
                        code: name.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
                      });
                    }}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Role Code (Unique identifier)</label>
                  <input
                    type="text"
                    placeholder="e.g. BRANCH_OPERATIONS_MANAGER"
                    value={newRole.code}
                    onChange={(e) => setNewRole({ ...newRole, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Scope of Authority</label>
                  <textarea
                    placeholder="Explain responsibilities, reporting hierarchy or branch assignment..."
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="form-textarea"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Permission Preset</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'counsellor', label: 'Counsellor', desc: 'Lead management & call logging' },
                      { id: 'readonly', label: 'Auditor / Viewer', desc: 'Read-only access across modules' },
                      { id: 'admin', label: 'Full Access', desc: 'Unrestricted CRUD claims' },
                    ].map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setNewRole({ ...newRole, template: tmpl.id })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: newRole.template === tmpl.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: newRole.template === tmpl.id ? 'var(--primary-light)' : 'var(--bg-card)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 700, color: newRole.template === tmpl.id ? 'var(--primary)' : 'inherit' }}>
                          {tmpl.label}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {tmpl.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateRoleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>Create Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
