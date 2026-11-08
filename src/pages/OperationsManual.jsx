import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckSquare,
  Network,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  IndianRupee,
  Calendar,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OperationsManual() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily-form'); // 'daily-form', 'checklist', 'matrix'
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 10, percent: 0 });
  const [matrix, setMatrix] = useState([]);
  const [reportsHistory, setReportsHistory] = useState([]);

  // 11-field Daily Reporting Form (Page 15)
  const [reportForm, setReportForm] = useState({
    user_id: user?.id || 6, // Shivani default
    report_date: new Date().toISOString().split('T')[0],
    total_calls_assigned: 85,
    connected_calls: 54,
    hot_leads_identified: 12,
    walk_ins_scheduled: 4,
    walk_ins_completed: 3,
    admissions_closed: 2,
    cash_collected: 50000,
    follow_ups_due_tomorrow: 16,
    challenges_faced: 'Candidates awaiting IELTS test results for UK January 2026 intake.',
    tomorrow_action_plan: 'Focus on scholarship counseling and walk-in conversions for nursing applicants.',
    reported_to: 'Shine MV (CEO)',
  });

  useEffect(() => {
    loadOperationsData();
  }, []);

  const loadOperationsData = async () => {
    setLoading(true);
    try {
      const [cRes, mRes, rRes] = await Promise.all([
        api.operations.getManagementChecklist(),
        api.operations.getReportingMatrix(),
        api.operations.getDailyReports(),
      ]);

      if (cRes.checklist) {
        setChecklist(cRes.checklist);
        setChecklistProgress(cRes.progress);
      }
      if (mRes.matrix) setMatrix(mRes.matrix);
      if (rRes.reports) setReportsHistory(rRes.reports);
    } catch (err) {
      console.warn('Error loading operations data', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Daily Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const res = await api.operations.submitDailyReport({
        ...reportForm,
        user_id: user?.id || 6,
      });

      if (res.success) {
        confetti({ particleCount: 60, spread: 70 });
        alert(res.message);
        loadOperationsData();
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  // Toggle Checklist Status
  const handleUpdateChecklistTask = async (id, status) => {
    try {
      const res = await api.operations.updateChecklistItem(id, { status });
      if (res.success) {
        loadOperationsData();
      }
    } catch (err) {
      console.warn('Error updating task', err);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Mirac Operations SOP Portal</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Operating Manual SOPs, Daily Staff Reporting Matrix & Executive 10-Task Checklist
        </p>
      </div>

      {/* Module Sub-tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('daily-form')}
          className={`module-tab ${activeTab === 'daily-form' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <FileText size={16} />
          <span>Staff Daily Report Form (Page 15)</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`module-tab ${activeTab === 'checklist' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <CheckSquare size={16} />
          <span>Daily Management Checklist (Page 19)</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`module-tab ${activeTab === 'matrix' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Network size={16} />
          <span>Reporting Matrix & Hierarchy (Page 5)</span>
        </button>
      </div>

      {/* ==================== TAB 1: 11-FIELD DAILY REPORTING FORM ==================== */}
      {activeTab === 'daily-form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Submission Form */}
          <div className="analytics-card">
            <div className="card-header">
              <div>
                <span className="card-title">
                  <FileText size={18} color="var(--primary)" />
                  Staff End-of-Day Operations Report
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Mandatory submission by <strong>04:45 PM</strong> daily to CEO Shine MV
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Report Date</label>
                  <input
                    type="date"
                    required
                    value={reportForm.report_date}
                    onChange={(e) => setReportForm({ ...reportForm, report_date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Submitting To</label>
                  <select
                    value={reportForm.reported_to}
                    onChange={(e) => setReportForm({ ...reportForm, reported_to: e.target.value })}
                    className="form-select"
                  >
                    <option value="Shine MV (CEO)">Shine MV (CEO - Mirac International)</option>
                    <option value="Mohammed Ameen (MD)">Mohammed Ameen (MD)</option>
                    <option value="Shifas PV (CFO)">Shifas PV (CFO)</option>
                  </select>
                </div>
              </div>

              {/* Call & Lead Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Total Calls Assigned</label>
                  <input
                    type="number"
                    required
                    value={reportForm.total_calls_assigned}
                    onChange={(e) => setReportForm({ ...reportForm, total_calls_assigned: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Connected Calls</label>
                  <input
                    type="number"
                    required
                    value={reportForm.connected_calls}
                    onChange={(e) => setReportForm({ ...reportForm, connected_calls: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hot Leads Identified</label>
                  <input
                    type="number"
                    required
                    value={reportForm.hot_leads_identified}
                    onChange={(e) => setReportForm({ ...reportForm, hot_leads_identified: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Walk-in & Admission Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Walk-Ins Scheduled</label>
                  <input
                    type="number"
                    required
                    value={reportForm.walk_ins_scheduled}
                    onChange={(e) => setReportForm({ ...reportForm, walk_ins_scheduled: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Walk-Ins Completed</label>
                  <input
                    type="number"
                    required
                    value={reportForm.walk_ins_completed}
                    onChange={(e) => setReportForm({ ...reportForm, walk_ins_completed: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Admissions Closed</label>
                  <input
                    type="number"
                    required
                    value={reportForm.admissions_closed}
                    onChange={(e) => setReportForm({ ...reportForm, admissions_closed: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Financial & Follow-ups */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Cash Collected (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={reportForm.cash_collected}
                    onChange={(e) => setReportForm({ ...reportForm, cash_collected: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-ups Due Tomorrow</label>
                  <input
                    type="number"
                    required
                    value={reportForm.follow_ups_due_tomorrow}
                    onChange={(e) => setReportForm({ ...reportForm, follow_ups_due_tomorrow: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Operational Challenges Faced</label>
                <textarea
                  rows="2"
                  value={reportForm.challenges_faced}
                  onChange={(e) => setReportForm({ ...reportForm, challenges_faced: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tomorrow's Action Plan</label>
                <textarea
                  rows="2"
                  value={reportForm.tomorrow_action_plan}
                  onChange={(e) => setReportForm({ ...reportForm, tomorrow_action_plan: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '14px' }}
              >
                <Send size={16} />
                <span>Submit Daily Report to CEO</span>
              </button>
            </form>
          </div>

          {/* Past Submissions Log */}
          <div className="analytics-card">
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
              Submitted Operations Logs
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportsHistory.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    padding: '14px',
                    background: 'var(--bg-app)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: 'var(--primary)' }}>
                      {rep.user?.name || 'Counsellor'}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {rep.report_date}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '8px 0' }}>
                    <div>Calls: <strong>{rep.total_calls_assigned}</strong></div>
                    <div>Conn: <strong>{rep.connected_calls}</strong></div>
                    <div>Admit: <strong style={{ color: '#10b981' }}>{rep.admissions_closed}</strong></div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Cash: <strong>₹{new Intl.NumberFormat('en-IN').format(rep.cash_collected)}</strong> | Reported to: {rep.reported_to}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DAILY MANAGEMENT CHECKLIST (Page 19) ==================== */}
      {activeTab === 'checklist' && (
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <span className="card-title">
                <CheckSquare size={18} color="var(--primary)" />
                Daily Management Checklist (10 Operational Standard Tasks)
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Page 19 of Mirac Manual: Structured daily protocol for executive management and operations
              </p>
            </div>

            {/* Completion Percentage Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                Progress: {checklistProgress.completed} / {checklistProgress.total} Completed ({checklistProgress.percent}%)
              </span>
              <div
                style={{
                  width: '120px',
                  height: '8px',
                  background: 'var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${checklistProgress.percent}%`,
                    height: '100%',
                    background: '#10b981',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checklist.map((task) => {
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  style={{
                    padding: '16px',
                    background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-app)',
                    border: isDone ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      onClick={() => handleUpdateChecklistTask(task.id, isDone ? 'pending' : 'completed')}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: isDone ? '2px solid #10b981' : '2px solid var(--border-strong)',
                        background: isDone ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                      }}
                    >
                      {isDone && <CheckCircle2 size={18} />}
                    </div>

                    <div>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                        }}
                      >
                        #{task.task_code}: {task.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {task.description}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>Role: <strong>{task.assigned_role}</strong></span>
                        <span>Deadline: <strong>{task.deadline_time}</strong></span>
                        {task.verified_by && <span>Verified: <strong>{task.verified_by}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateChecklistTask(task.id, e.target.value)}
                      className="form-select"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: REPORTING MATRIX (Page 5) ==================== */}
      {activeTab === 'matrix' && (
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <span className="card-title">
                <Network size={18} color="var(--primary)" />
                Mirac International Official Reporting Hierarchy Matrix (Page 5)
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Reporting timelines, communication channels & designated authority protocols
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {matrix.map((row, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  background: 'var(--bg-app)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                    {row.role}
                  </h4>
                  <span className="status-pill status-admission">
                    {row.deadline}
                  </span>
                </div>

                <div style={{ fontSize: '13px' }}>
                  Reports Directly To: <strong>{row.reports_to}</strong>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Channel: <strong>{row.channel}</strong>
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    color: 'var(--text-main)',
                  }}
                >
                  Key Metrics: {row.key_metrics}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
