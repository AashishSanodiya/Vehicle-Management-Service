import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { revenueAPI } from '../api';

export default function Revenue() {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchRevenue(); }, [period, year]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const params = period === 'monthly' ? { year } : period === 'daily' ? { days: 30 } : {};
      const res = await revenueAPI.get(period, params);
      setData(res.data.data);
      setSummary(res.data.summary);
    } catch { }
    finally { setLoading(false); }
  };

  const formatCurrency = (v) => `₹${Number(v).toLocaleString()}`;

  return (
    <div>
      <div className="page-header">
        <h2>📊 Revenue Dashboard</h2>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">₹{Number(summary.total_revenue || 0).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.total_paid_services || 0}</div>
          <div className="stat-label">Completed Services</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{summary.pending_services || 0}</div>
          <div className="stat-label">Pending Services</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {['daily', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              className={`btn ${period === p ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          {period === 'monthly' && (
            <select
              className="btn btn-outline btn-sm"
              value={year}
              onChange={e => setYear(e.target.value)}
              style={{ padding: '6px 10px' }}
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>Loading chart...</p>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#bbb' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p>No revenue data for this period.</p>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Mark services as completed and process payments to see data here.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: 16, textTransform: 'capitalize' }}>
              {period} revenue — {data.length} data point{data.length !== 1 ? 's' : ''}
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #e0e4ef' }} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#0f3460" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 32 }}>
              <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: 16 }}>Services count trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Services" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
