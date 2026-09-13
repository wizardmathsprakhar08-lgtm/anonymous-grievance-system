import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FilePlus, Search, ListTodo, BarChart3, LogIn, Settings, Check, Globe } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../api/config';

const MobileBottomNav = ({ authUser }) => {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getApiBaseUrl());
  const [savedMsg, setSavedMsg] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSaveUrl = (e) => {
    e.preventDefault();
    setApiBaseUrl(currentUrl);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      setShowSettings(false);
    }, 1500);
  };

  return (
    <>
      {/* Mobile Bottom Floating Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around text-[10px] font-medium">
          
          <Link
            to="/"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/') ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FilePlus className="w-5 h-5 mb-0.5" />
            <span>Submit</span>
          </Link>

          <Link
            to="/track"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/track') ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Track</span>
          </Link>

          {authUser ? (
            <>
              <Link
                to="/officer"
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                  isActive('/officer') ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTodo className="w-5 h-5 mb-0.5" />
                <span>Queue</span>
              </Link>

              {authUser.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                    isActive('/admin') ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mb-0.5" />
                  <span>Stats</span>
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive('/login') ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-5 h-5 mb-0.5" />
              <span>Officer</span>
            </Link>
          )}

          {/* In-app Mobile Backend Switcher */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200"
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span>Server</span>
          </button>

        </div>
      </div>

      {/* Server URL Config Modal for Mobile */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Mobile Backend URL</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              When running inside Android Emulator or physical phone, enter your backend address:
            </p>

            <form onSubmit={handleSaveUrl} className="space-y-3">
              <input
                type="text"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                placeholder="e.g. http://10.0.2.2:8000/api"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex space-x-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCurrentUrl('http://10.0.2.2:8000/api')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  Emulator (10.0.2.2)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentUrl('/api')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  Web (/api)
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                >
                  {savedMsg ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{savedMsg ? 'Saved!' : 'Save URL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
