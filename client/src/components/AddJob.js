import React, { useState } from 'react';
import API_BASE_URL from '../config';

const BallsBG = () => (
  <div className="balls-bg addjob-balls-bg">
    {[...Array(18)].map((_,i) => (
      <div key={i} className={`ball addjob-ball addjob-ball${i+1}`}></div>
    ))}
  </div>
);

const AddJob = ({ token, onJobAdded }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [status, setStatus] = useState('Applied');
  const [appliedOn, setAppliedOn] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company,
          role,
          jd,
          status,
          applied_on: appliedOn,
          skills: skills.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add job');
      onJobAdded && onJobAdded();
      setCompany(''); setRole(''); setJd(''); setStatus('Applied'); setAppliedOn(''); setSkills('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addjob-bg">
      <BallsBG />
      <form onSubmit={handleSubmit} className="add-job-form addjob-card">
        <div className="addjob-icon">📄</div>
        <h2 className="addjob-title">Add Job Application</h2>
        {error && <div className="alert-error" style={{marginBottom:12}}>{error}</div>}
        <input className="addjob-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" required />
        <input className="addjob-input" value={role} onChange={e => setRole(e.target.value)} placeholder="Role/Position" required />
        <textarea className="addjob-input" value={jd} onChange={e => setJd(e.target.value)} placeholder="Job Description" required />
        <input className="addjob-input" value={appliedOn} onChange={e => setAppliedOn(e.target.value)} placeholder="Applied On (YYYY-MM-DD)" type="date" />
        <input className="addjob-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma separated)" />
        <select className="addjob-input" value={status} onChange={e => setStatus(e.target.value)}>
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button className="addjob-btn" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Job'}</button>
      </form>
    </div>
  );
};

export default AddJob;
