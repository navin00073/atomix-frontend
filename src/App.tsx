import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PageBackgroundStage } from './components/PageBackgroundStage';
import { OneClickDemoBanner } from './components/OneClickDemoBanner';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { PatientManagement } from './components/PatientManagement';
import { CameraCenter } from './components/CameraCenter';
import { PatientVisits } from './components/PatientVisits';
import { StaffAttendance } from './components/StaffAttendance';
import { IotAttendanceCenter } from './components/IotAttendanceCenter';
import { DoctorStation } from './components/DoctorStation';
import { PharmacyDashboard } from './components/PharmacyDashboard';
import { SmartVendingMachine } from './components/SmartVendingMachine';
import { MedicineTraceability } from './components/MedicineTraceability';
import { InventoryAndAi } from './components/InventoryAndAi';
import { IotDeviceCenter } from './components/IotDeviceCenter';
import { DigitalFlowVisualization } from './components/DigitalFlowVisualization';
import { AuditLogsView } from './components/AuditLogsView';
import { PatientPortal } from './components/PatientPortal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { LoginScreen } from './components/LoginScreen';
import { EmergencyResponseCenter } from './components/EmergencyResponseCenter';
import { AnimatePresence, motion } from 'motion/react';
import { Shield, Atom } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, theme, colorTheme, isAuthenticated } = useHospital();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CommandCenterDashboard key="dashboard" />;
      case 'emergency':
        return <EmergencyResponseCenter key="emergency" />;
      case 'patients':
        return <PatientManagement key="patients" />;
      case 'camera':
        return <CameraCenter key="camera" />;
      case 'visits':
        return <PatientVisits key="visits" />;
      case 'staff':
        return <StaffAttendance key="staff" />;
      case 'iot-attendance':
        return <IotAttendanceCenter key="iot-attendance" />;
      case 'doctor':
        return <DoctorStation key="doctor" />;
      case 'pharmacy':
        return <PharmacyDashboard key="pharmacy" />;
      case 'vending':
        return <SmartVendingMachine key="vending" />;
      case 'traceability':
        return <MedicineTraceability key="traceability" />;
      case 'inventory':
      case 'ai-forecasting':
        return <InventoryAndAi key="inventory" />;
      case 'iot-center':
        return <IotDeviceCenter key="iot-center" />;
      case 'flow':
        return <DigitalFlowVisualization key="flow" />;
      case 'audit':
        return <AuditLogsView key="audit" />;
      case 'patient-portal':
        return <PatientPortal key="patient-portal" />;
      case 'privacy':
        return <PrivacyPolicy key="privacy" />;
      default:
        return <CommandCenterDashboard key="dashboard" />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
        : 'bg-[#f4f7fe] text-slate-900 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Dynamic Ambient Color Glow Orbs (Neo-claymorphic background matching image.png) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {theme === 'dark' ? (
          <>
            <div className={`absolute -top-40 left-1/4 w-[850px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] blur-3xl transition-all duration-700 ${
              colorTheme === 'emerald'
                ? 'from-emerald-500/15 via-teal-600/10 to-transparent'
                : colorTheme === 'sapphire'
                ? 'from-blue-500/15 via-indigo-600/10 to-transparent'
                : colorTheme === 'purple'
                ? 'from-purple-500/15 via-fuchsia-600/10 to-transparent'
                : colorTheme === 'amber'
                ? 'from-amber-500/15 via-orange-600/10 to-transparent'
                : colorTheme === 'crimson'
                ? 'from-rose-500/15 via-red-600/10 to-transparent'
                : 'from-cyan-500/12 via-indigo-600/10 to-transparent'
            }`} />
            <div className={`absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-700 ${
              colorTheme === 'emerald'
                ? 'bg-emerald-600/15'
                : colorTheme === 'sapphire'
                ? 'bg-blue-600/15'
                : colorTheme === 'purple'
                ? 'bg-fuchsia-600/15'
                : colorTheme === 'amber'
                ? 'bg-amber-600/15'
                : colorTheme === 'crimson'
                ? 'bg-rose-600/15'
                : 'bg-purple-600/10'
            }`} />
            <div className={`absolute bottom-10 -right-40 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-700 ${
              colorTheme === 'emerald'
                ? 'bg-teal-600/15'
                : colorTheme === 'sapphire'
                ? 'bg-sky-600/15'
                : colorTheme === 'purple'
                ? 'bg-purple-600/15'
                : colorTheme === 'amber'
                ? 'bg-orange-600/15'
                : colorTheme === 'crimson'
                ? 'bg-pink-600/15'
                : 'bg-cyan-600/10'
            }`} />
          </>
        ) : (
          <>
            {/* Luminous pastel mesh */}
            <div className={`absolute -top-40 left-1/3 w-[950px] h-[550px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] blur-3xl transition-all duration-700 ${
              colorTheme === 'emerald'
                ? 'from-emerald-400/25 via-teal-300/20 to-transparent'
                : colorTheme === 'sapphire'
                ? 'from-blue-400/25 via-indigo-300/20 to-transparent'
                : colorTheme === 'purple'
                ? 'from-purple-400/25 via-fuchsia-300/20 to-transparent'
                : colorTheme === 'amber'
                ? 'from-amber-400/25 via-orange-300/20 to-transparent'
                : colorTheme === 'crimson'
                ? 'from-rose-400/25 via-red-300/20 to-transparent'
                : 'from-sky-400/25 via-indigo-300/20 to-transparent'
            }`} />
            <div className={`absolute top-1/4 -left-40 w-[650px] h-[650px] rounded-full blur-3xl transition-all duration-700 ${
              colorTheme === 'emerald'
                ? 'bg-emerald-300/25'
                : colorTheme === 'sapphire'
                ? 'bg-indigo-300/25'
                : colorTheme === 'purple'
                ? 'bg-violet-300/25'
                : colorTheme === 'amber'
                ? 'bg-amber-300/25'
                : colorTheme === 'crimson'
                ? 'bg-rose-300/25'
                : 'bg-purple-300/25'
            }`} />
            <div className={`absolute top-1/2 right-0 w-[550px] h-[550px] rounded-full blur-3xl transition-all duration-700 ${
              colorTheme === 'emerald'
                ? 'bg-teal-200/30'
                : colorTheme === 'sapphire'
                ? 'bg-sky-200/30'
                : colorTheme === 'purple'
                ? 'bg-pink-200/30'
                : colorTheme === 'amber'
                ? 'bg-yellow-200/30'
                : colorTheme === 'crimson'
                ? 'bg-pink-200/30'
                : 'bg-pink-200/30'
            }`} />
            <div className="absolute bottom-10 left-1/4 w-[750px] h-[750px] bg-amber-200/25 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <Navigation />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-14">
          {/* Dynamic 3D Neo-Clay Hero & Per-Page Wallpaper Stage */}
          <PageBackgroundStage />

          {/* Active Tab View with Spring Physics Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.985 }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>

        <OneClickDemoBanner />

        {/* Modern Neo-Design Footer */}
        <footer className={`border-t py-6 px-4 text-xs mt-auto backdrop-blur-xl transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-950/90 border-slate-900/80 text-slate-400'
            : 'bg-white/80 border-slate-200/80 text-slate-600 shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/25">
                <div className={`w-full h-full rounded-[9px] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
                  <Atom className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <span className={`font-tech font-extrabold tracking-wider uppercase text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                .ATOMIX
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-mono-tech text-blue-600 dark:text-cyan-400 font-semibold">Team AtomiX</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Autonomous Healthcare & Medicine Automation</span>
            </div>

            <div className={`flex items-center gap-4 text-[11px] font-mono-tech ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Dual-Sensors & Line Tracking
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>ESP32 Telemetry Mesh</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainContent />
    </HospitalProvider>
  );
}
