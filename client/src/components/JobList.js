import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';

const statusColors = {
  Applied: '#2563eb',
  Interview: '#f59e42',
  Offer: '#22c55e',
  Rejected: '#ef4444',
  Other: '#64748b'
};

const JobList = ({ token }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editFormData, setEditFormData] = useState({ company: '', role: '', status: '', jd: '' });

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs');
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAI = async (job) => {
    setAiLoading(job.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jd: job.jd, jobId: job.id })
      });
      await res.json();
      fetchJobs();
    } catch (err) {
      setError('AI error: ' + err.message);
    } finally {
      setAiLoading(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete job');
      fetchJobs();
    } catch (err) {
      setError('Delete error: ' + err.message);
    }
  };

  const handleEdit = (job) => {
    setEditingJobId(job.id);
    setEditFormData({
      company: job.company,
      role: job.role,
      status: job.status,
      jd: job.jd
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to update job');
      setEditingJobId(null);
      fetchJobs();
    } catch (err) {
      setError('Update error: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '30px', background: 'linear-gradient(135deg, #f9f9ff, #e0f7fa, #fff3e0)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
        📋 Job Applications
      </h2>

      {loading && <div className="spinner"></div>}
      {error && <div className="alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '1100px', margin: '0 auto' }}>
        {jobs.map(job => (
          <div
            key={job.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid #eee'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
          >
            {editingJobId === job.id ? (
              <div className="edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input name="company" value={editFormData.company} onChange={handleEditChange} placeholder="Company" />
                <input name="role" value={editFormData.role} onChange={handleEditChange} placeholder="Role" />
                <select name="status" value={editFormData.status} onChange={handleEditChange}>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Other">Other</option>
                </select>
                <textarea name="jd" value={editFormData.jd} onChange={handleEditChange} placeholder="Job Description" />
                <button onClick={() => handleEditSave(job.id)}>💾 Save</button>
                <button onClick={() => setEditingJobId(null)}>❌ Cancel</button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>{job.company}</div>
                <div style={{ fontSize: '1rem', color: '#666' }}>{job.role}</div>
                <div style={{
                  background: statusColors[job.status] || statusColors.Other,
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  display: 'inline-block'
                }}>
                  {job.status}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#777' }}>Applied: {job.applied_on}</div>
                <div style={{ fontSize: '0.85rem', color: '#777' }}>Skills: {Array.isArray(job.skills) ? job.skills.join(', ') : ''}</div>
                <div style={{ fontSize: '0.9rem', color: '#444' }}><b>Description:</b> {job.jd}</div>
                <div style={{ fontSize: '0.9rem', color: '#444' }}>
                  <b>AI Summary:</b> {job.ai_summary || <span style={{ color: '#999' }}>N/A</span>}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#444' }}>
                  <b>Suggestions:</b> {job.suggestions || <span style={{ color: '#999' }}>N/A</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', flex: 1 }}
                    onClick={() => handleAI(job)}
                    disabled={aiLoading === job.id}
                  >
                    {aiLoading === job.id ? '⏳ Processing...' : '🤖 AI Parse'}
                  </button>
                  <button style={{ background: '#f59e42', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleEdit(job)}>✏️ Edit</button>
                  <button style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleDelete(job.id)}>🗑️ Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
