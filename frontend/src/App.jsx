import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import InstallAppBanner from './components/InstallAppBanner';
import SubmitGrievance from './pages/SubmitGrievance';
import TrackStatus from './pages/TrackStatus';
import OfficerQueue from './pages/OfficerQueue';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
        <Navbar authUser={authUser} setAuthUser={setAuthUser} />
        <InstallAppBanner />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SubmitGrievance />} />
            <Route path="/track" element={<TrackStatus />} />
            <Route
              path="/officer"
              element={<OfficerQueue authUser={authUser} token={token} />}
            />
            <Route
              path="/admin"
              element={<AdminDashboard authUser={authUser} token={token} />}
            />
            <Route
              path="/login"
              element={<Login setAuthUser={setAuthUser} setToken={setToken} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-400">
              JanAwaaz AI &mdash; Anonymous Public Grievance Redressal System
            </p>
            <p className="mt-1">
              Multi-Agent AI Architecture (IntakeAgent &bull; ClassificationAgent &bull; UrgencyAgent &bull; SimilarityAgent &bull; RoutingAgent)
            </p>
          </div>
        </footer>

        {/* Mobile Persistent Bottom Nav Bar */}
        <MobileBottomNav authUser={authUser} />
      </div>
    </Router>
  );
}

export default App;
