import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Search,
  Filter,
  Phone,
  Calendar,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  SlidersHorizontal,
  X,
  PhoneCall,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leads({ newLeadModalOpen, setNewLeadModalOpen }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states for New Lead
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    city: 'Kozhikode',
    source: 'Meta',
    client_status: 'Lead',
    course_interested: 'B.Sc Nursing / Healthcare',
    destination_country: 'United Kingdom',
    intake_year: '2026',
    expected_revenue: 45000,
    priority: 'High',
    notes: '',
  });

  // Follow-up form state (Page 14)
  const [followUpData, setFollowUpData] = useState({
    follow_up_date: new Date().toISOString().split('T')[0],
    reminder_time: '11:30 AM',
    next_action: 'Call for counselling update',
    type: 'Call',
    notes: 'Discuss admission documents, university shortlist and visa requirements.',
  });

  // Call log form state
  const [callLogData, setCallLogData] = useState({
    call_type: 'Outbound',
    call_status: 'Connected',
    duration_seconds: 145,
    remarks: 'Candidate interested in UK January 2026 intake. Requested prospectus.',
  });

  // Import wizard 4-step state (Training Page 2 & 5)
  const [importStep, setImportStep] = useState(1);
  const [importStrategy, setImportStrategy] = useState('equal_round_robin');
  const [importDuplicatesCheck, setImportDuplicatesCheck] = useState(true);
  const [importCounselors, setImportCounselors] = useState([]);
  const [selectedSingleUser, setSelectedSingleUser] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Load leads
  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (stageFilter !== 'all') params.stage = stageFilter;
      if (statusFilter !== 'all') params.client_status = statusFilter;
      if (sourceFilter !== 'all') params.source = sourceFilter;

      const res = await api.leads.list(params);
      if (res.success && res.leads) {
        setLeads(res.leads.data || []);
        setPagination({
          current_page: res.leads.current_page,
          last_page: res.leads.last_page,
          total: res.leads.total,
        });
      }
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    loadStaff();
  }, [search, stageFilter, statusFilter, sourceFilter]);

  const loadStaff = async () => {
    try {
      const res = await api.admin.getStaff();
      if (res.success && res.staff) {
        setImportCounselors(res.staff);
        if (res.staff.length > 0) {
          setSelectedSingleUser(res.staff[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load staff for assignment', err);
    }
  };

  // Handle Create Lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await api.leads.create(newLead);
      if (res.success) {
        setNewLeadModalOpen(false);
        fetchLeads(1);
        confetti({ particleCount: 50, spread: 60 });
        setNewLead({
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          city: 'Kozhikode',
          source: 'Meta',
          client_status: 'Lead',
          course_interested: 'B.Sc Nursing / Healthcare',
          destination_country: 'United Kingdom',
          intake_year: '2026',
          expected_revenue: 45000,
          priority: 'High',
          notes: '',
        });
      }
    } catch (err) {
      alert(err.message || 'Error creating lead');
    }
  };

  // Handle Log Call
  const handleLogCall = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await api.leads.logCall(selectedLead.id, callLogData);
      if (res.success) {
        setShowCallModal(false);
        fetchLeads(pagination.current_page);
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (err) {
      alert(err.message || 'Failed to log call');
    }
  };

  // Handle Add Follow-up
  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await api.leads.addFollowUp(selectedLead.id, followUpData);
      if (res.success) {
        setShowFollowUpModal(false);
        fetchLeads(pagination.current_page);
        alert('Follow-up scheduled successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to add follow-up');
    }
  };

  // Execute Import Wizard (Admin training Page 2 & 5)
  const handleRunImport = async () => {
    setIsImporting(true);
    // Mock incoming leads from Google Sheet / Meta campaign
    const sampleImportBatch = [
      { first_name: 'Adarsh', last_name: 'Menon', phone: '+91 9847111222', email: 'adarsh.m@gmail.com', city: 'Kochi', source: 'Google Sheet Sync', course_interested: 'MBA Healthcare', destination_country: 'UK' },
      { first_name: 'Anjali', last_name: 'Nair', phone: '+91 9847222333', email: 'anjali.n@gmail.com', city: 'Trivandrum', source: 'Meta Ad Campaign', course_interested: 'M.Sc Nursing', destination_country: 'Ireland' },
      { first_name: 'Gokul', last_name: 'Das', phone: '+91 9847333444', email: 'gokul.d@gmail.com', city: 'Calicut', source: 'Google Sheet Sync', course_interested: 'B.Tech AI & Data', destination_country: 'Germany' },
      { first_name: 'Meera', last_name: 'Varghese', phone: '+91 9847444555', email: 'meera.v@gmail.com', city: 'Kottayam', source: 'Meta Ad Campaign', course_interested: 'Public Health', destination_country: 'Canada' },
      { first_name: 'Vishnu', last_name: 'Prasad', phone: '+91 9847555666', email: 'vishnu.p@gmail.com', city: 'Kannur', source: 'Google Sheet Sync', course_interested: 'Hospital Administration', destination_country: 'UK' },
    ];

    try {
      const res = await api.leads.import({
        leads: sampleImportBatch,
        distribution_strategy: importStrategy,
        single_user_id: selectedSingleUser,
        check_duplicates: importDuplicatesCheck,
      });

      if (res.success) {
        setIsImporting(false);
        setShowImportWizard(false);
        fetchLeads(1);
        confetti({ particleCount: 100, spread: 80 });
        alert(res.message);
      }
    } catch (err) {
      setIsImporting(false);
      alert(err.message || 'Import failed');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Lead Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Total Leads Ingested: <strong>{pagination.total}</strong> | Real-time Round Robin Allocation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Import Lead Button */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              setImportStep(1);
              setShowImportWizard(true);
            }}
          >
            <Upload size={16} />
            <span>Import Lead</span>
          </button>

          {/* New Lead Button */}
          <button
            className="btn btn-primary"
            onClick={() => setNewLeadModalOpen(true)}
          >
            <Plus size={16} />
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="data-table-container">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
            <div className="search-box" style={{ width: '100%', maxWidth: '320px' }}>
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Search by name, phone, course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              <option value="all">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Interested">Interested</option>
              <option value="Application">Application</option>
              <option value="Admission">Admission</option>
              <option value="Registration">Registration</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Not Interested">Not Interested</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="form-select"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              <option value="all">All Sources</option>
              <option value="Meta">Meta Ads</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Google Sheet Sync">Google Sheet Sync</option>
              <option value="Social media">Social media</option>
              <option value="Walk-in">Walk-in</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" />
                </th>
                <th>Lead Code</th>
                <th>Student / Candidate</th>
                <th>Phone & Calls</th>
                <th>Course & Country</th>
                <th>Source</th>
                <th>Client Status</th>
                <th>Assigned Counselor</th>
                <th>Next Follow-Up</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading leads from MySQL database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const statusClass =
                    lead.client_status === 'Admission'
                      ? 'status-admission'
                      : lead.client_status === 'Application'
                      ? 'status-application'
                      : lead.client_status === 'Interested'
                      ? 'status-interested'
                      : lead.client_status === 'Not Interested'
                      ? 'status-cancelled'
                      : 'status-lead';

                  return (
                    <tr key={lead.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '12px' }}>
                          {lead.lead_code || `MIRAC-2026-${lead.id}`}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong style={{ fontSize: '13px' }}>
                            {lead.first_name} {lead.last_name}
                          </strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {lead.email || 'No email provided'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12.5px' }}>{lead.phone}</span>
                          {/* Call Badge (Clicking opens Call Modal & increments counter) */}
                          <button
                            className="call-badge"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowCallModal(true);
                            }}
                            title="Click to log call with this student"
                          >
                            <Phone size={11} />
                            <span>{lead.call_count || lead.calls_count || 0}</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                            {lead.course_interested || 'Study Abroad Program'}
                          </span>
                          <div style={{ fontSize: '11px', color: '#0ea5e9' }}>
                            🌍 {lead.destination_country || 'United Kingdom'} ({lead.intake_year || '2026'})
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tag-badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                          {lead.source || lead.lead_source || 'Meta'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          {lead.client_status || lead.lead_stage || 'Lead'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              background: '#3b82f6',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {lead.assigned_user?.name ? lead.assigned_user.name.charAt(0) : 'S'}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>
                            {lead.assigned_user?.name || 'Shivani'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowFollowUpModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Calendar size={13} />
                          <span>
                            {lead.follow_ups && lead.follow_ups.length > 0
                              ? new Date(lead.follow_ups[0].follow_up_date).toLocaleDateString('en-GB')
                              : 'Schedule'}
                          </span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowCallModal(true);
                            }}
                            title="Quick Call"
                          >
                            <PhoneCall size={13} color="#2563eb" />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowFollowUpModal(true);
                            }}
                            title="Schedule Follow-up"
                          >
                            <Clock size={13} color="#f59e0b" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} leads total)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.current_page <= 1}
              onClick={() => fetchLeads(pagination.current_page - 1)}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchLeads(pagination.current_page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODAL 1: + NEW LEAD MODAL ==================== */}
      {newLeadModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Create New Student Lead</h3>
              <button
                onClick={() => setNewLeadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="modal-body">
                {/* Section 1: Basic Details */}
                <h4 style={{ fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Section 1: Student Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul"
                      value={newLead.first_name}
                      onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Varma"
                      value={newLead.last_name}
                      onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 9847000000"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      placeholder="student@gmail.com"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Section 2: Course & Academic Interest */}
                <h4 style={{ fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '10px' }}>
                  Section 2: Study Abroad Program
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Course / Degree Interested</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Sc Nursing, MBA, MS Computer Science"
                      value={newLead.course_interested}
                      onChange={(e) => setNewLead({ ...newLead, course_interested: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Country</label>
                    <select
                      value={newLead.destination_country}
                      onChange={(e) => setNewLead({ ...newLead, destination_country: e.target.value })}
                      className="form-select"
                    >
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="Australia">Australia</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Georgia">Georgia (MBBS)</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Ingestion Source & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Lead Source</label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      className="form-select"
                    >
                      <option value="Meta">Meta Ads</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Google Sheet Sync">Google Sheet Sync</option>
                      <option value="Walk-in">Walk-in</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client Status</label>
                    <select
                      value={newLead.client_status}
                      onChange={(e) => setNewLead({ ...newLead, client_status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Interested">Interested</option>
                      <option value="Application">Application</option>
                      <option value="Admission">Admission</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={newLead.priority}
                      onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}
                      className="form-select"
                    >
                      <option value="High">High (Hot Lead)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setNewLeadModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Allocate Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: 4-STEP IMPORT WIZARD (Admin Training Page 2 & 5) ==================== */}
      {showImportWizard && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Lead Import & Distribution Wizard</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Scale-Up CRM Automated Lead Distribution Engine (Admin Training Manual)
                </p>
              </div>
              <button
                onClick={() => setShowImportWizard(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper Progress */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-app)',
                padding: '12px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                justifyContent: 'space-between',
              }}
            >
              {[
                { num: 1, label: 'Sheet Source' },
                { num: 2, label: 'Field Mapping' },
                { num: 3, label: 'Duplicate Check' },
                { num: 4, label: 'Distribution Strategy' },
              ].map((st) => (
                <div
                  key={st.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: importStep >= st.num ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: importStep === st.num ? 700 : 500,
                    fontSize: '12.5px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: importStep >= st.num ? 'var(--primary)' : 'var(--border-subtle)',
                      color: importStep >= st.num ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {st.num}
                  </div>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>

            <div className="modal-body">
              {/* STEP 1: Sheet Selection */}
              {importStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      border: '2px dashed var(--primary-border)',
                      padding: '30px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      background: 'var(--bg-app)',
                    }}
                  >
                    <FileSpreadsheet size={40} color="#1e60dc" style={{ margin: '0 auto 12px' }} />
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Select Lead Google Sheet or CSV File</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Drag and drop your Meta lead export or Google Sheets webhook CSV here
                    </p>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: '14px' }}>
                      Browse Files (5 sample student leads pre-loaded)
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600 }}>Active Google Sheet Sync Connection:</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Sheet ID: <code>1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code> (Meta Study Abroad Batch)
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Field Mapping */}
              {importStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Map column headers from your spreadsheet to the Mirac CRM lead schema:
                  </p>
                  {[
                    { sheetCol: 'Full Name / Candidate', crmField: 'first_name & last_name' },
                    { sheetCol: 'Mobile / WhatsApp', crmField: 'phone' },
                    { sheetCol: 'Email ID', crmField: 'email' },
                    { sheetCol: 'Interested Course', crmField: 'course_interested' },
                    { sheetCol: 'Target Country', crmField: 'destination_country' },
                  ].map((mapping, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-app)',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Sheet: "{mapping.sheetCol}"</span>
                      <span>➡️</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        CRM Field: {mapping.crmField}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Duplicate Checking */}
              {importStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      padding: '16px',
                      background: 'var(--bg-app)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Duplicate Prevention Protocol</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        The CRM verifies submitted telephone numbers and email addresses against all active and archived records.
                      </p>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px' }}>
                    <input
                      type="checkbox"
                      checked={importDuplicatesCheck}
                      onChange={(e) => setImportDuplicatesCheck(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Automatically skip duplicates and tag existing student records</span>
                  </label>
                </div>
              )}

              {/* STEP 4: Lead Distribution Strategy (Training Page 2, 5) */}
              {importStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Select how the imported leads should be distributed among counsellors:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { id: 'equal_round_robin', title: '1. Equal Round Robin', desc: 'Evenly distributes leads across active counselors in a circular queue' },
                      { id: 'single_user', title: '2. Single User', desc: 'Assigns 100% of imported leads to one specific counsellor' },
                      { id: 'daily_auto_drip', title: '3. Daily Auto Drip', desc: 'Enforces staff daily call limit (e.g. 80 calls/day max)' },
                      { id: 'field_wise', title: '4. Field-wise Routing', desc: 'Routes by destination country (UK, Germany, Ireland)' },
                      { id: 'weighted', title: '5. Weighted % Share', desc: 'Senior: 50%, Junior: 30%, Intern: 20%' },
                      { id: 'manual', title: '6. Manual Assignment', desc: 'Leads unassigned in pool for branch manager manual dispatch' },
                    ].map((strat) => (
                      <div
                        key={strat.id}
                        onClick={() => setImportStrategy(strat.id)}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: importStrategy === strat.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: importStrategy === strat.id ? 'var(--primary-light)' : 'var(--bg-app)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <strong style={{ fontSize: '13px', color: importStrategy === strat.id ? 'var(--primary)' : 'inherit' }}>
                          {strat.title}
                        </strong>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {strat.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {importStrategy === 'single_user' && (
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label">Select Staff Member:</label>
                      <select
                        value={selectedSingleUser}
                        onChange={(e) => setSelectedSingleUser(e.target.value)}
                        className="form-select"
                      >
                        {importCounselors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.role || c.designation || 'Counselor'} (Limit: {c.daily_call_limit || 80}/day)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {importStep > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImportStep(importStep - 1)}
                >
                  Back
                </button>
              )}

              {importStep < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setImportStep(importStep + 1)}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isImporting}
                  className="btn btn-primary"
                  onClick={handleRunImport}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <Sparkles size={16} />
                  <span>{isImporting ? 'Ingesting Leads...' : 'Execute Import & Distribution'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: DYNAMIC FOLLOW-UP MODAL (Page 14) ==================== */}
      {showFollowUpModal && selectedLead && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Schedule Follow-up</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Student: <strong>{selectedLead.first_name} {selectedLead.last_name}</strong> ({selectedLead.phone})
                </p>
              </div>
              <button
                onClick={() => setShowFollowUpModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFollowUp}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Follow-up Date *</label>
                    <input
                      type="date"
                      required
                      value={followUpData.follow_up_date}
                      onChange={(e) => setFollowUpData({ ...followUpData, follow_up_date: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reminder Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:30 AM"
                      value={followUpData.reminder_time}
                      onChange={(e) => setFollowUpData({ ...followUpData, reminder_time: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Next Action *</label>
                    <select
                      value={followUpData.next_action}
                      onChange={(e) => setFollowUpData({ ...followUpData, next_action: e.target.value })}
                      className="form-select"
                    >
                      <option value="Call for counselling update">Call for counselling update</option>
                      <option value="Send university prospectus">Send university prospectus</option>
                      <option value="Walk-in appointment">Walk-in appointment</option>
                      <option value="Document collection">Document collection</option>
                      <option value="Fee payment reminder">Fee payment reminder</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      value={followUpData.type}
                      onChange={(e) => setFollowUpData({ ...followUpData, type: e.target.value })}
                      className="form-select"
                    >
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="Task">Task</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Discussion Summary</label>
                  <textarea
                    rows="3"
                    value={followUpData.notes}
                    onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFollowUpModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: INSTANT CALL LOGGER MODAL ==================== */}
      {showCallModal && selectedLead && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Log Phone Call</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Calling {selectedLead.first_name} {selectedLead.last_name} ({selectedLead.phone})
                </p>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogCall}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Call Type</label>
                    <select
                      value={callLogData.call_type}
                      onChange={(e) => setCallLogData({ ...callLogData, call_type: e.target.value })}
                      className="form-select"
                    >
                      <option value="Outbound">Outbound Call</option>
                      <option value="Inbound">Inbound Call</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Call Outcome</label>
                    <select
                      value={callLogData.call_status}
                      onChange={(e) => setCallLogData({ ...callLogData, call_status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Connected">Connected (Productive)</option>
                      <option value="Busy">Busy</option>
                      <option value="No Answer">No Answer / Switched Off</option>
                      <option value="Left Voicemail">Left Voicemail</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Call Duration (seconds)</label>
                  <input
                    type="number"
                    value={callLogData.duration_seconds}
                    onChange={(e) => setCallLogData({ ...callLogData, duration_seconds: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Call Remarks & Next Steps</label>
                  <textarea
                    rows="3"
                    value={callLogData.remarks}
                    onChange={(e) => setCallLogData({ ...callLogData, remarks: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCallModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <PhoneCall size={15} />
                  <span>Save Call Log & Increment Badge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
