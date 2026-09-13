import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, User, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api/config';

const Login = ({ setAuthUser, setToken }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Invalid username or password');
      }

      const data = await res.json();

      const userObj = {
        user_id: data.user_id,
        username: data.username,
        role: data.role,
        department_id: data.department_id,
        department_name: data.department_name
      };

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userObj));

      setToken(data.access_token);
      setAuthUser(userObj);

      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/officer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Officer & Admin Portal
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Authorized government officials login to review & resolve grievances.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        {error && (
          <div className="mb-6 bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs p-3.5 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter officer username"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Section */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Quick Demo Credentials (1-Click Fill)</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickFill('admin', 'admin123')}
              className="p-2 bg-slate-900 hover:bg-slate-700/60 text-slate-200 border border-slate-700 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-emerald-400">Admin Account</div>
              <div className="text-[10px] text-slate-400">admin / admin123</div>
            </button>

            <button
              onClick={() => quickFill('officer_water', 'officer123')}
              className="p-2 bg-slate-900 hover:bg-slate-700/60 text-slate-200 border border-slate-700 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-blue-400">Water Officer</div>
              <div className="text-[10px] text-slate-400">officer_water / officer123</div>
            </button>

            <button
              onClick={() => quickFill('officer_road', 'officer123')}
              className="p-2 bg-slate-900 hover:bg-slate-700/60 text-slate-200 border border-slate-700 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-amber-400">Road Officer</div>
              <div className="text-[10px] text-slate-400">officer_road / officer123</div>
            </button>

            <button
              onClick={() => quickFill('officer_elec', 'officer123')}
              className="p-2 bg-slate-900 hover:bg-slate-700/60 text-slate-200 border border-slate-700 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-yellow-400">Elec Officer</div>
              <div className="text-[10px] text-slate-400">officer_elec / officer123</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
