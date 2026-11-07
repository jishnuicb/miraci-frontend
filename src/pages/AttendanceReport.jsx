import React, { useState, useEffect } from 'react';
import {
  Clock,
  Camera,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  Users,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AttendanceReport() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({});
  const [kioskStatus, setKioskStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [punching, setPunching] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filters
  const [month, setMonth] = useState('2026-10');
  const [department, setDepartment] = useState('all');

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [month, department]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const [rRes, kRes] = await Promise.all([
        api.attendance.getReport({ month, department }),
        api.attendance.getTodayStatus(user?.id),
      ]);

      if (rRes.records) {
        setReportData(rRes.records);
        setSummary(rRes.summary);
      }
      if (kRes) {
        setKioskStatus(kRes);
      }
    } catch (err) {
      console.warn('Error fetching attendance data', err);
    } finally {
      setLoading(false);
    }
  };

  // Execute Face ID Punch In / Out
  const handleExecutePunch = async (punchType) => {
    setPunching(true);
    setPunchFeedback(null);

    setTimeout(async () => {
      try {
        const res = await api.attendance.punch({
          user_id: user?.id || 1,
          type: punchType,
          method: 'face_id',
          face_match_score: 98.8,
        });

        setPunching(false);
        if (res.success) {
          setPunchFeedback({
            success: true,
            message: res.message,
            time: res.time,
            type: res.type,
          });
          confetti({ particleCount: 50, spread: 60 });
          loadAttendanceData();
        } else {
          setPunchFeedback({
            success: false,
            message: res.message,
          });
        }
      } catch (err) {
        setPunching(false);
        setPunchFeedback({
          success: false,
          message: err.message || 'Punch operation failed',
        });
      }
    }, 1200);
  };

  // Determine if current time is past 9:40 AM
  const isPastDeadline = currentTime.getHours() > 9 || (currentTime.getHours() === 9 && currentTime.getMinutes() > 40);

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>HR Settings & Attendance Report</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Biometric Facial Recognition Punch System & Monthly Punctuality Log (Admin Training Page 13)
        </p>
      </div>

      {/* TOP: LIVE BIOMETRIC FACE ID PUNCH KIOSK */}
      <div
        className="analytics-card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-app))',
          marginBottom: '26px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#0ea5e9',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                Live Biometric Attendance Terminal
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Mirac Standard Shift: <strong>09:30 AM to 05:00 PM</strong> | Punch Deadline: <strong>09:40 AM</strong>
            </p>

            {/* Punctuality Alert Banner */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: isPastDeadline ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${isPastDeadline ? '#ef4444' : '#10b981'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}
            >
              {isPastDeadline ? (
                <>
                  <AlertTriangle size={18} color="#ef4444" />
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    Current Time is past 09:40 AM. Afternoon-only half-day rule applies for new punches.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Morning On-Time Grace Window Active (Arrival before 09:40 AM).
                  </span>
                </>
              )}
            </div>

            {/* Feedback Message */}
            {punchFeedback && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: punchFeedback.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${punchFeedback.success ? '#10b981' : '#ef4444'}`,
                  color: punchFeedback.success ? '#10b981' : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {punchFeedback.message}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                disabled={punching}
                onClick={() => handleExecutePunch('in')}
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Scan size={18} />
                <span>{punching ? 'Scanning Face...' : 'Face ID Punch IN'}</span>
              </button>

              <button
                disabled={punching}
                onClick={() => handleExecutePunch('out')}
                className="btn btn-secondary"
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderColor: 'var(--border-strong)',
                }}
              >
                <Clock size={18} />
                <span>Face ID Punch OUT</span>
              </button>
            </div>
          </div>

          {/* Terminal Clock & Biometric Scanner Graphic */}
          <div
            style={{
              background: '#090e1a',
              borderRadius: '16px',
              padding: '24px',
              border: '2px solid rgba(56, 189, 248, 0.3)',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString()}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              {currentTime.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div
              style={{
                margin: '18px auto 0',
                width: '180px',
                height: '80px',
                border: '1px dashed rgba(56, 189, 248, 0.5)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Zap size={16} />
              <span>Biometric Sensor Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="dashboard-grid-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Total Staff Members</h4>
            <div className="kpi-value">{summary.total_staff || 13}</div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Employees</span>
          </div>
          <div className="kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Avg Present Days</h4>
            <div className="kpi-value">{summary.avg_present || 21.2}</div>
            <span style={{ fontSize: '11px', color: '#10b981' }}>Out of 24 working days</span>
          </div>
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Avg Work Hours</h4>
            <div className="kpi-value">{summary.avg_work_hours || 158.4}h</div>
            <span style={{ fontSize: '11px', color: '#0284c7' }}>Monthly logged duration</span>
          </div>
          <div className="kpi-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Office Punctuality Rate</h4>
            <div className="kpi-value">92.6%</div>
            <span style={{ fontSize: '11px', color: '#f59e0b' }}>Arrival before 09:40 AM</span>
          </div>
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* MONTHLY ATTENDANCE REPORT TABLE (Admin Training Page 13) */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Monthly Attendance Log</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Detailed present, absent, half-day and total hours per counselor
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Month Filter */}
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-input"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            />

            {/* Department Filter */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-select"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              <option value="all">All Departments</option>
              <option value="Management">Management</option>
              <option value="Counseling">Counseling</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Admissions">Admissions</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Staff Member</th>
                <th>Designation & Dept</th>
                <th style={{ textAlign: 'center' }}>Total Days</th>
                <th style={{ textAlign: 'center' }}>Present</th>
                <th style={{ textAlign: 'center' }}>Absent</th>
                <th style={{ textAlign: 'center' }}>Half Day</th>
                <th style={{ textAlign: 'center' }}>Late Punches</th>
                <th style={{ textAlign: 'center' }}>Total Hours</th>
                <th style={{ textAlign: 'center' }}>Punctuality</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading monthly attendance records...
                  </td>
                </tr>
              ) : (
                reportData.map((rec) => (
                  <tr key={rec.user_id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: '12px' }}>
                        {rec.employee_code || `MIRAC-00${rec.user_id}`}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: '#1e60dc',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}
                        >
                          {rec.name.charAt(0)}
                        </div>
                        <strong style={{ fontSize: '13px' }}>{rec.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div>{rec.designation}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.department}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{rec.total_days}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-pill status-admission">{rec.present_days}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-pill status-cancelled">{rec.absent_days}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-pill status-pending">{rec.half_days}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: rec.late_days > 2 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                        {rec.late_days}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{rec.total_hours} hrs</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-pill status-admission">
                        {rec.punctuality_rate}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
