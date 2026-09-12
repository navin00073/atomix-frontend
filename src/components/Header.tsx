import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { ThemeCustomizerBar } from './ThemeCustomizerBar';
import {
  ShieldAlert,
  Play,
  Bell,
  CheckCircle2,
  Cpu,
  Atom,
  AlertTriangle,
  Radio,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  HeartPulse,
  Trash2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    systemMode,
    toggleSystemMode,
    isEmergencyMode,
    triggerEmergencyMode,
    cancelEmergencyMode,
    alerts,
    markAlertRead,
    clearAllAlerts,
    runCompleteEndToEndDemo,
    demoProgress,
    resetAllToDefault,
    wipeDemoDataForFreshStart,
    setActiveTab,
    theme,
    toggleTheme,
    currentUser,
    logout,
    activeEmergency,
  } = useHospital();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-[#070b14]/90 border-slate-800/80 text-slate-100'
        : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-sm'
    }`}>
      {/* Top System Ticker */}
      <div className={`px-4 py-1.5 border-b text-[11px] font-mono-tech flex flex-wrap items-center justify-between gap-2 transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800/80 text-slate-400'
          : 'bg-slate-50/95 border-slate-200/80 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            SYSTEM STATUS: OPERATIONAL
          </span>
          <span className={theme === 'dark' ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>
          <span className="hidden sm:inline">Devices Online: <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>8/8</strong></span>
          <span className={theme === 'dark' ? 'text-slate-700 hidden md:inline' : 'text-slate-300 hidden md:inline'}>|</span>
          <span className="hidden md:inline">Vending Machines: <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>3/3</strong></span>
          <span className={theme === 'dark' ? 'text-slate-700 hidden lg:inline' : 'text-slate-300 hidden lg:inline'}>|</span>
          <span className="hidden lg:inline">AI Engine: <strong className="text-cyan-500">Ready</strong></span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded-full border font-semibold tracking-wider flex items-center gap-1 text-[10px] ${
            theme === 'dark'
              ? 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300'
              : 'bg-cyan-50 border-cyan-200 text-cyan-700'
          }`}>
            <Sparkles className="w-3 h-3 text-cyan-500" />
            TEAM AtomiX
          </span>
          <button
            onClick={resetAllToDefault}
            className={`transition flex items-center gap-1 text-[10px] ${
              theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Reset to default demo seed data"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Demo</span>
          </button>

          <span className={theme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>|</span>

          <button
            onClick={() => setShowWipeConfirm(true)}
            className="transition flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 font-medium"
            title="Wipe all demo patients, doctors, and visits for a fresh start"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>Fresh Start</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer group flex items-center gap-3"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25 group-hover:scale-105 group-hover:shadow-cyan-400/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Atom className="w-6 h-6 text-cyan-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-tech tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                  ATOMIX
                </h1>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-700/60 font-bold tracking-wider shadow-inner">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Hospital Automation & Smart Medicine Delivery • by Team AtomiX
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switch: Live vs Simulation */}
          <button
            onClick={toggleSystemMode}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono-tech font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              systemMode === 'LIVE HARDWARE'
                ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-md shadow-emerald-950/60'
                : 'bg-indigo-950/80 border-indigo-600/70 text-indigo-300 shadow-md shadow-indigo-950/60'
            }`}
            title="Toggle between Live Hardware and Simulation Mode"
          >
            <span className={`w-2 h-2 rounded-full ${systemMode === 'LIVE HARDWARE' ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'}`}></span>
            <Radio className={`w-3.5 h-3.5 ${systemMode === 'LIVE HARDWARE' ? 'text-emerald-400' : 'text-indigo-400'}`} />
            <span className="hidden sm:inline">{systemMode}</span>
            <span className="sm:hidden">{systemMode === 'LIVE HARDWARE' ? 'LIVE' : 'SIM'}</span>
          </button>

          {/* Run Complete Demo Button */}
          <button
            onClick={() => runCompleteEndToEndDemo()}
            disabled={demoProgress.isRunning}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-tech tracking-wider uppercase flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
              demoProgress.isRunning
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 border border-cyan-400/40 shadow-cyan-500/25'
            }`}
            title="Execute full 21-step automated hospital workflow demo"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Run Complete Demo (21 Steps)</span>
            <span className="md:hidden">Demo</span>
          </button>

          {/* Emergency Button */}
          {isEmergencyMode ? (
            <button
              onClick={cancelEmergencyMode}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-tech font-bold text-xs flex items-center gap-1.5 animate-bounce shadow-lg shadow-rose-600/50 border border-rose-400"
              title="Deactivate Hospital Emergency Protocol"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>CANCEL EMERGENCY</span>
            </button>
          ) : (
            <button
              onClick={() => triggerEmergencyMode(undefined, 'Code Blue Emergency Override activated')}
              className="px-3 py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 font-tech font-bold text-xs flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              title="Initiate Emergency Mode (Prioritizes queues, dispatches emergency robot lane)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">EMERGENCY</span>
            </button>
          )}

          {/* Theme & Wallpaper Selector */}
          <ThemeCustomizerBar />

          {/* Theme Toggle: Cyber Obsidian vs Neo Claymorphic 3D */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
              theme === 'dark'
                ? 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 shadow-cyan-950/60'
                : 'bg-white hover:bg-slate-50 text-blue-700 border-blue-200 shadow-slate-200'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Neo-Clay 3D Light' : 'Cyber Obsidian Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xl:inline text-[11px] font-mono-tech">CYBER</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xl:inline text-[11px] font-mono-tech">NEO-3D</span>
              </>
            )}
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className={`p-2 rounded-full border relative transition-all duration-200 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
              title="Hospital Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-600/50">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold font-tech text-slate-200 uppercase tracking-wider">
                      Hospital Notifications ({alerts.length})
                    </span>
                  </div>
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAllAlerts}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {!alerts || alerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No active alerts. All nodes quiet.</div>
                  ) : (
                    alerts.map((alt, index) => (
                      <div
                        key={`${alt.id}-${index}`}
                        onClick={() => {
                          markAlertRead(alt.id);
                          if (alt.linkTab) setActiveTab(alt.linkTab);
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-950/50 border-rose-800 text-rose-200 hover:bg-rose-900/50'
                            : alt.severity === 'WARNING'
                            ? 'bg-amber-950/40 border-amber-800 text-amber-200 hover:bg-amber-900/40'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        } ${!alt.isRead ? 'ring-1 ring-cyan-500/50' : 'opacity-80'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-100">{alt.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono-tech">{alt.timestamp}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-300">{alt.message}</p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono-tech uppercase">{alt.category}</span>
                          {!alt.isRead && (
                            <span className="text-cyan-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Mark read
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Active Indicator Shortcut */}
          {activeEmergency && (
            <button
              onClick={() => setActiveTab('emergency')}
              className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-lg shadow-red-950/60 border border-red-400 cursor-pointer"
              title="Jump to Active Code Blue Response"
            >
              <HeartPulse className="w-3.5 h-3.5 animate-bounce" />
              <span>{activeEmergency.code} ACTIVE</span>
            </button>
          )}

          {/* User Profile Badge & Logout Button */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="font-semibold text-slate-200 block truncate max-w-[110px] leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono block leading-none">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                id="btn-header-logout"
                type="button"
                onClick={() => logout()}
                className={`p-2 rounded-full border transition-all duration-200 hover:scale-105 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 shadow-sm'
                }`}
                title="Log Out of Command Center"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fresh Start (Wipe Demo Data) Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold font-tech text-white uppercase">Wipe Demo Data For Fresh Start?</h4>
                <p className="text-xs text-rose-300 font-mono-tech">
                  Clear Patients • Doctors • Staff • Visits • Prescriptions
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove all demo patients, doctor/staff profiles, queue tickets, and prescriptions so you can start with a fresh slate and register your own custom patients and doctors.
            </p>

            <p className="text-[11px] text-cyan-400/90 font-mono-tech bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40">
              💡 Tip: You can reload default demo data at any time by clicking &quot;Reset Demo&quot;.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowWipeConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  wipeDemoDataForFreshStart();
                  setShowWipeConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Wipe Data for Fresh Start</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
