import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHospital } from '../context/HospitalContext';
import { PAGE_THEMES } from '../data/pageThemes';
import { Play, Sparkles, Shield, ArrowDown, Bot, HeartPulse } from 'lucide-react';

interface PageBackgroundStageProps {
  onRunDemo?: () => void;
  onExploreFlow?: () => void;
}

export const PageBackgroundStage: React.FC<PageBackgroundStageProps> = ({
  onRunDemo,
  onExploreFlow,
}) => {
  const { activeTab, theme, runCompleteEndToEndDemo, setActiveTab } = useHospital();
  const currentTheme = PAGE_THEMES[activeTab] || PAGE_THEMES.dashboard;

  const handleDemoClick = () => {
    if (onRunDemo) {
      onRunDemo();
    } else {
      runCompleteEndToEndDemo();
    }
  };

  const handleFlowClick = () => {
    if (onExploreFlow) {
      onExploreFlow();
    } else {
      setActiveTab('flow');
    }
  };

  return (
    <div className="relative w-full overflow-hidden transition-all duration-700 ease-out mb-8">
      {/* 1. Ambient Pastel Gradient Orbs (Matching nowpay style in image.png) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Left Golden-Peach Sphere */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -top-10 -left-16 w-80 h-80 rounded-full blur-2xl opacity-60 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-amber-500/20 to-rose-500/10'
              : 'bg-gradient-to-br from-amber-300/40 via-orange-200/30 to-rose-200/20'
          }`}
        />

        {/* Top-Right Iridescent Violet/Sky Aura */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -top-20 -right-20 w-[550px] h-[550px] rounded-full blur-3xl opacity-70 ${
            theme === 'dark'
              ? 'bg-gradient-to-bl from-indigo-600/20 via-purple-600/15 to-transparent'
              : 'bg-gradient-to-bl from-purple-300/40 via-sky-200/40 to-pink-200/20'
          }`}
        />

        {/* Dynamic Per-Tab Theme Glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradientAura} blur-3xl transition-all duration-1000 opacity-60 pointer-events-none`}
        />
      </div>

      {/* 2. Dynamic Per-Page Wallpaper Background Banner */}
      <div className="relative z-10 w-full rounded-[36px] sm:rounded-[44px] overflow-hidden border transition-all duration-500 shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border-white/60 dark:border-slate-800/80 shadow-slate-200/50 dark:shadow-slate-950/60">
        {/* Subtle Background Image Overlay for each specific page */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <img
              src={currentTheme.bgImageUrl}
              alt={currentTheme.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter opacity-15 dark:opacity-10 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40 dark:from-[#070b14] dark:via-[#070b14]/95 dark:to-[#070b14]/70" />
          </motion.div>
        </AnimatePresence>

        {/* 3. Hero Content & 3D Stage (Identical in structure & charm to image.png) */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[440px]">
          {/* Left Column: Bold Typography & Action Controls */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-5">
            {/* Tagline / Eyebrow Pill */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-tech tracking-widest uppercase font-bold px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800/60 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                {currentTheme.tagline}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono-tech text-slate-400 dark:text-slate-500">
                {currentTheme.badgeText}
              </span>
            </div>

            {/* Main Headline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTheme.headline}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  {currentTheme.headline.split(',')[0]},
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    {currentTheme.headline.split(',')[1] || ''}
                  </span>
                  <span className="text-blue-600">.</span>
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* Sub-headline */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTheme.subheadline}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal"
              >
                {currentTheme.subheadline}
              </motion.p>
            </AnimatePresence>

            {/* Action Buttons (Electric blue pill from image.png) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDemoClick}
                className="px-6 py-3 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/45 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run Full 21-Step Simulation</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFlowClick}
                className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm transition-all duration-200 flex items-center gap-2 border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>Explore 7 Stages</span>
              </motion.button>
            </div>

            {/* Quick Micro-stats pill strip */}
            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs text-slate-500 dark:text-slate-400 font-mono-tech">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Dual-Sensors (IR + HX711)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-cyan-500" />
                Autonomous Delivery Rover
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                IoT Vitals Telemetry
              </span>
            </div>
          </div>

          {/* Right Column: The 3D Neo-Claymorphic Stage (Directly replicating image.png) */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center min-h-[380px]">
            {/* The Slanted Giant Gradient Pill Track (The visual centerpiece of image.png) */}
            <motion.div
              animate={{
                rotate: [-35, -33, -35],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-44 sm:w-56 h-[340px] sm:h-[400px] rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/35 overflow-hidden flex items-center justify-center p-3 border-4 border-white/40 dark:border-slate-700/40"
            >
              {/* Internal Concentric Glass Ring */}
              <div className="w-28 sm:w-36 h-28 sm:h-36 rounded-full border-4 border-white/30 flex items-center justify-center backdrop-blur-sm">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-2 border-white/40 flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 text-white/80 animate-bounce" />
                </div>
              </div>
            </motion.div>

            {/* Floating 3D Geometric Shapes (Matching image.png: sphere, cone, pills) */}
            {/* 3D Cone (White Clay) */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 4, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute right-4 sm:right-10 bottom-6 sm:bottom-12 z-20"
            >
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
                <path
                  d="M30 5 L55 60 A25 10 0 0 1 5 60 Z"
                  fill="url(#clayConeGrad)"
                  filter="drop-shadow(0 10px 15px rgba(0,0,0,0.15))"
                />
                <ellipse cx="30" cy="60" rx="25" ry="8" fill="#e2e8f0" />
                <defs>
                  <linearGradient id="clayConeGrad" x1="10" y1="10" x2="50" y2="65" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="0.7" stopColor="#f1f5f9" />
                    <stop offset="1" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* 3D Sphere (White Clay with Soft Ambient Shadow) */}
            <motion.div
              animate={{
                y: [0, 10, 0],
                x: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute right-2 sm:right-4 bottom-2 z-20 w-12 h-12 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-xl shadow-slate-400/30 border border-white/60"
            />

            {/* Floating Pastel Pill / Capsule (Mint Green) */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-6 sm:left-12 top-16 z-20 w-10 h-20 rounded-full bg-gradient-to-b from-emerald-300 to-teal-400 shadow-lg shadow-emerald-400/30 rotate-45 border-2 border-white/60"
            />

            {/* Floating Yellow Accent Dot */}
            <div className="absolute left-1/3 top-8 w-4 h-4 rounded-full bg-amber-400 shadow-md shadow-amber-400/40" />

            {/* Floating Small Blue Sphere */}
            <div className="absolute left-12 bottom-16 w-5 h-5 rounded-full bg-blue-600 shadow-md shadow-blue-600/40" />

            {/* 3D Friendly Doctor & Autonomous Rover Illustration Character */}
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
            >
              {/* Stylized Neo-Claymorphic Medical Doctor Vector Figure */}
              <div className="relative w-44 sm:w-52 h-64 sm:h-72 flex flex-col items-center justify-end">
                {/* Doctor Head */}
                <div className="relative w-16 h-18 rounded-full bg-[#fed7aa] border-2 border-[#fdba74] shadow-md flex flex-col items-center justify-center overflow-hidden">
                  {/* Hair */}
                  <div className="absolute top-0 left-0 right-0 h-7 bg-[#f59e0b] rounded-t-full" />
                  {/* Eyes */}
                  <div className="flex items-center gap-3 mt-2 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  </div>
                  {/* Friendly Smile */}
                  <div className="w-3 h-1.5 border-b-2 border-slate-700 rounded-full mt-1 z-10" />
                </div>

                {/* Stethoscope */}
                <div className="w-12 h-6 border-b-4 border-slate-700 rounded-full -mt-2 z-20 relative flex items-center justify-center">
                  <div className="absolute -bottom-2 w-3 h-3 rounded-full bg-cyan-400 border border-slate-700" />
                </div>

                {/* Torso & Blue Scrub Shirt */}
                <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-gradient-to-b from-[#38bdf8] to-[#0284c7] shadow-xl relative z-10 flex items-center justify-center p-2">
                  {/* Doctor Tablet (Just like the character in image.png!) */}
                  <motion.div
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-12 rounded-lg bg-white shadow-md border border-slate-200 p-1 flex flex-col justify-between"
                  >
                    <div className="w-full h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <div className="space-y-0.5">
                      <div className="w-3/4 h-1 rounded-full bg-slate-200" />
                      <div className="w-1/2 h-1 rounded-full bg-slate-200" />
                    </div>
                    <div className="w-4 h-1 rounded-full bg-emerald-400 self-end" />
                  </motion.div>
                </div>

                {/* White Clinical Trousers & Shoes */}
                <div className="flex gap-2 -mt-1 z-5">
                  <div className="w-6 h-20 bg-white rounded-b-xl border border-slate-200 shadow-sm" />
                  <div className="w-6 h-20 bg-white rounded-b-xl border border-slate-200 shadow-sm" />
                </div>
                <div className="flex gap-4 -mt-2 z-10">
                  <div className="w-8 h-3.5 bg-orange-500 rounded-full shadow-md" />
                  <div className="w-8 h-3.5 bg-orange-500 rounded-full shadow-md" />
                </div>
              </div>
            </motion.div>

            {/* Floating Status Pill 1 (Matching "Sending... 40%" from image.png) */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                x: [0, 4, 0],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-0 sm:left-2 top-28 sm:top-32 z-30 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-150 dark:border-slate-700/80 flex items-center gap-2.5 max-w-[210px]"
            >
              <img
                src={currentTheme.chip1.avatar}
                alt={currentTheme.chip1.title}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="truncate">
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-1 truncate">
                  <span>{currentTheme.chip1.title}</span>
                  <span className="text-[10px] text-emerald-600 font-mono-tech">
                    {currentTheme.chip1.progress}%
                  </span>
                </div>
                {/* Animated Progress Bar */}
                <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                    style={{ width: `${currentTheme.chip1.progress || 50}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Floating Status Pill 2 (Matching "John D $25.68" from image.png) */}
            <motion.div
              animate={{
                y: [0, 8, 0],
                x: [0, -3, 0],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute right-0 sm:right-2 top-8 sm:top-12 z-30 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-150 dark:border-slate-700/80 flex items-center gap-2.5"
            >
              <img
                src={currentTheme.chip2.avatar}
                alt={currentTheme.chip2.title}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {currentTheme.chip2.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono-tech">
                  {currentTheme.chip2.subtitle}
                </div>
              </div>
              {currentTheme.chip2.badge && (
                <span className="text-[10px] font-bold font-mono-tech px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {currentTheme.chip2.badge}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
