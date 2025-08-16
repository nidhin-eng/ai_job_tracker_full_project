


import './App.css';
import Auth from './components/Auth';
import AddJob from './components/AddJob';
import JobList from './components/JobList';
import React, { useState } from 'react';

// Animated 3D balls background for the full app (keep as a background layer, not a wrapper)
const BallsBG = () => (
  <div className="balls-bg app-balls-bg">
    {[...Array(32)].map((_,i) => (
      <div key={i} className={`ball app-ball app-ball${i+1}`}></div>
    ))}
  </div>
);


function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [refresh, setRefresh] = useState(false);

  const handleAuth = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  if (!token) return <Auth onAuth={handleAuth} />;

  return (
    <>
      <BallsBG />
      <div className="App">
        <h1>AI Job Tracker</h1>
        <button style={{float:'right',marginTop:-40}} onClick={handleLogout}>Logout</button>
        <AddJob token={token} onJobAdded={() => setRefresh(r => !r)} />
        <JobList token={token} key={refresh} />
      </div>
    </>
  );
}

export default App;
