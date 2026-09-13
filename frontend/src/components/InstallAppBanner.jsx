import React, { useState, useEffect } from 'react';
import { Download, X, MoreVertical, Smartphone, Check } from 'lucide-react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed as PWA or native app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowPrompt(false);
      return;
    }

    const handler = (e) => {
      // Prevent default browser mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // If browser doesn't support automatic prompt (e.g. over local HTTP IP), show step guide
      setShowGuide(true);
    }
  };

  if (!showPrompt || installed) return null;

  return (
    <>
      {/* Floating Sticky Install Banner */}
      <div className="bg-gradient-to-r from-emerald-900/90 to-teal-950/90 border-b border-emerald-500/30 px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block truncate">Install JanAwaaz AI App</span>
              <span className="text-[10px] text-slate-300">Add to your home screen for full-screen app experience</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>

            <button
              onClick={() => setShowPrompt(false)}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Manual Android Chrome Install Guide Modal (For HTTP connection) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Smartphone className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">How to Install on Chrome</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                When opening over local Wi-Fi, Android Chrome lets you install in 2 quick taps:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <div>
                    Tap the <strong>three dots menu (⋮)</strong> at the top-right corner of Chrome.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <div>
                    Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <div>
                    Tap <strong>Add / Install</strong> to confirm.
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                The JanAwaaz AI app icon will be placed directly onto your home screen!
              </p>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppBanner;
