import React, { useState, useEffect } from 'react';
import {
  Clock,
  PhoneCall,
  Users2,
  CalendarCheck,
  CheckCircle,
  TrendingUp,
  Award,
  Filter,
  ArrowUpRight,
  Sparkles,
  Phone,
  Video,
  ListTodo,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ onNavigateToLeads }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('today'); // 'today', 'weekly', 'monthly'
  const [salesMetric, setSalesMetric] = useState('revenue'); // 'revenue', 'calls', 'opportunities', 'converted'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await api.dashboard.getMetrics(filter);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [filter]);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const kpis = data?.kpis || {
    pending_leads: 10,
    today_calls: 38,
    today_meetings: 7,
    today_tasks: 14,
    schedules: 9,
  };

  const clientChart = data?.client_status_chart || {
    All: 25,
    Lead: 7,
    'Not Interested': 3,
    Interested: 2,
    Application: 2,
    Admission: 9,
    Registration: 1,
    Cancel: 0,
    'Payment Pending': 1,
  };

  const pipeline = data?.sales_pipeline || [
    { stage: 'Lead', count: 25, percentage: 100, color: '#3b82f6' },
    { stage: 'Contacted', count: 22, percentage: 78, color: '#8b5cf6' },
    { stage: 'Opportunity', count: 4, percentage: 45, color: '#f59e0b' },
    { stage: 'Converted', count: 10, percentage: 28, color: '#10b981' },
  ];

  const closedStatus = data?.closed_status || {
    target: 500000,
    actual: 875066,
    won: 10,
    lost: 3,
    percentage: 76.9,
  };

  const teamActivity = data?.team_activity || {
    calls: 264,
    meetings: 42,
    tasks: 89,
    whatsapp: 312,
  };

  const topSalesReps = (data?.top_sales_reps || []).sort((a, b) => b[salesMetric] - a[salesMetric]);

  const maxChartValue = Math.max(...Object.values(clientChart), 10);

  return (
    <div className="page-wrapper">
      {/* Header Greeting & Filter Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
            Welcome back, {user?.name || 'Administrator'}! 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Mirac International CRM Analytics & Operations Overview
          </p>
        </div>

        {/* Today | Weekly | Monthly Filter */}
        <div className="pill-filter">
          {['today', 'weekly', 'monthly'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill-btn ${filter === f ? 'active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* TOP 5 KPI CARDS (Matching Page 2 of Admin Configuration) */}
      <div className="dashboard-grid-5">
        {/* Card 1: My Pending List */}
        <div className="kpi-card" onClick={onNavigateToLeads} style={{ cursor: 'pointer' }}>
          <div className="kpi-info">
            <h4>My Pending List</h4>
            <div className="kpi-value">{kpis.pending_leads}</div>
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Needs Follow-up</span>
          </div>
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Card 2: My Today Calls */}
        <div className="kpi-card" onClick={onNavigateToLeads} style={{ cursor: 'pointer' }}>
          <div className="kpi-info">
            <h4>My Today Calls</h4>
            <div className="kpi-value">{kpis.today_calls}</div>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>Limit: {user?.daily_call_limit || 80}</span>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <PhoneCall size={24} />
          </div>
        </div>

        {/* Card 3: My Today Meetings */}
        <div className="kpi-card">
          <div className="kpi-info">
            <h4>My Today Meetings</h4>
            <div className="kpi-value">{kpis.today_meetings}</div>
            <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>Counselling sessions</span>
          </div>
          <div className="kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Users2 size={24} />
          </div>
        </div>

        {/* Card 4: My Today Tasks */}
        <div className="kpi-card">
          <div className="kpi-info">
            <h4>My Today Tasks</h4>
            <div className="kpi-value">{kpis.today_tasks}</div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Assigned items</span>
          </div>
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Card 5: Schedules */}
        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Schedules</h4>
            <div className="kpi-value">{kpis.schedules}</div>
            <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Upcoming demos</span>
          </div>
          <div className="kpi-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <CalendarCheck size={24} />
          </div>
        </div>
      </div>

      {/* MIDDLE 3 ANALYTICS CARDS (Matching Pages 3 & 4 of Admin Configuration) */}
      <div className="analytics-grid-3">
        {/* Card 1: Client Status Bar Chart (All 9 Stages) */}
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={18} color="var(--primary)" />
              Client Status Overview
            </span>
            <div className="pill-filter">
              {['today', 'weekly', 'monthly'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`pill-btn ${filter === f ? 'active' : ''}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Container */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '8px',
              height: '220px',
              paddingTop: '20px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {Object.entries(clientChart).map(([stageName, count]) => {
              const heightPercent = Math.max(12, Math.round((count / maxChartValue) * 180));
              const isAll = stageName === 'All';
              const isAdmission = stageName === 'Admission';
              const barColor = isAll
                ? 'var(--primary)'
                : isAdmission
                ? '#10b981'
                : stageName === 'Cancel'
                ? '#ef4444'
                : stageName === 'Interested'
                ? '#f59e0b'
                : 'var(--secondary)';

              return (
                <div
                  key={stageName}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}px`,
                      background: `linear-gradient(180deg, ${barColor}, ${barColor}99)`,
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 4px 10px ${barColor}33`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '9.5px',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.1,
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                    }}
                    title={stageName}
                  >
                    {stageName.length > 8 ? stageName.slice(0, 7) + '..' : stageName}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Total Inquiries Tracked: <strong>{clientChart.All || 25}</strong></span>
            <span>Admissions Closed: <strong style={{ color: '#10b981' }}>{clientChart.Admission || 9}</strong></span>
          </div>
        </div>

        {/* Card 2: Sales Pipeline Inverted Funnel (Slide 4) */}
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <Sparkles size={18} color="#8b5cf6" />
              Sales Pipeline
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Conversion Funnel</span>
          </div>

          <div className="funnel-container">
            {pipeline.map((stage, idx) => {
              // Funnel taper width calculation (inverted trapezoid)
              const widthPerc = 100 - idx * 16;
              return (
                <div
                  key={stage.stage}
                  className="funnel-stage"
                  style={{
                    width: `${widthPerc}%`,
                    background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '4px' }}>
                      Tier {idx + 1}
                    </span>
                    <span>{stage.stage}</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800 }}>{stage.count}</span>
                    <span style={{ fontSize: '11px', opacity: 0.9 }}>({stage.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Lead-to-Admission Ratio:</span>
            <strong style={{ color: '#10b981' }}>28.4% (Industry Avg: 15%)</strong>
          </div>
        </div>

        {/* Card 3: Closed Status Speedometer Arc Gauge (Slide 4) */}
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <Award size={18} color="#10b981" />
              Closed Status
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Revenue Target</span>
          </div>

          <div className="gauge-container">
            <svg viewBox="0 0 200 110" className="gauge-svg">
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Colored Progress Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - Math.min(1, closedStatus.percentage / 100))}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            <div className="gauge-center-stat">
              <span className="percentage">{closedStatus.percentage}%</span>
              <span className="label">Achievement</span>
            </div>
          </div>

          {/* Revenue & Won / Lost Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target</span>
              <p style={{ fontSize: '13px', fontWeight: 800 }}>{formatCurrency(closedStatus.target)}</p>
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actual</span>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>{formatCurrency(closedStatus.actual)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '12px' }}>
            <span className="status-pill status-admission">Won: {closedStatus.won} Deals</span>
            <span className="status-pill status-cancelled">Lost: {closedStatus.lost} Leads</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION (Matching Page 5 of Admin Configuration) */}
      <div className="bottom-grid-2">
        {/* Team Activity: 4 Cards (Call, Meeting, Task, WhatsApp) */}
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <PhoneCall size={18} color="var(--primary)" />
              Team Activity
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>All Departments</span>
          </div>

          <div className="team-activity-grid">
            <div className="activity-box">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <div className="act-count">{teamActivity.calls}</div>
                <div className="act-title">Phone Calls</div>
              </div>
            </div>

            <div className="activity-box">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={20} />
              </div>
              <div>
                <div className="act-count">{teamActivity.meetings}</div>
                <div className="act-title">Meetings / Demos</div>
              </div>
            </div>

            <div className="activity-box">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ListTodo size={20} />
              </div>
              <div>
                <div className="act-count">{teamActivity.tasks}</div>
                <div className="act-title">Tasks Executed</div>
              </div>
            </div>

            <div className="activity-box">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="act-count">{teamActivity.whatsapp}</div>
                <div className="act-title">WhatsApp Messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Sales Rep Leaderboard (Slide 5) */}
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">
              <Award size={18} color="#f59e0b" />
              Top 5 Sales Rep
            </span>

            {/* Metric Toggle: Revenue | Calls | Opportunity | Converted */}
            <div className="pill-filter">
              {[
                { id: 'revenue', label: 'Revenue' },
                { id: 'calls', label: 'Calls' },
                { id: 'opportunities', label: 'Opportunity' },
                { id: 'converted', label: 'Converted' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSalesMetric(m.id)}
                  className={`pill-btn ${salesMetric === m.id ? 'active' : ''}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="leaderboard-list">
            {topSalesReps.slice(0, 5).map((rep, idx) => {
              const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
              const displayVal =
                salesMetric === 'revenue'
                  ? formatCurrency(rep.revenue)
                  : salesMetric === 'calls'
                  ? `${rep.calls} calls`
                  : salesMetric === 'opportunities'
                  ? `${rep.opportunities} opps`
                  : `${rep.converted} admissions`;

              return (
                <div key={rep.id} className="leaderboard-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={`rank-badge ${rankClass}`}>
                      #{idx + 1}
                    </div>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #67004f, #b19c81)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {rep.name.charAt(0)}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{rep.name}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {rep.designation || 'Educational Counsellor'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {displayVal}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>
                      {rep.conversion_rate}% Conv. Rate
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
