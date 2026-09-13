import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, FilePlus, Search, ListTodo, BarChart3, LogIn, LogOut, User } from 'lucide-react';

const Navbar = ({ authUser, setAuthUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">JanAwaaz AI</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Multi-Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Anonymous Grievance Redressal</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>Submit Issue</span>
            </Link>

            <Link
              to="/track"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/track') ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Status</span>
            </Link>

            {authUser && (
              <Link
                to="/officer"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/officer') ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                <span>Officer Queue</span>
              </Link>
            )}

            {authUser && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
            )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center space-x-3">
            {authUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{authUser.username}</span>
                  <span className="text-[10px] text-slate-400">
                    {authUser.role === 'admin' ? 'System Administrator' : (authUser.department_name || 'Officer')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Officer Portal</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
