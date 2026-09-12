import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { PAGE_THEMES } from '../data/pageThemes';
import { ColorTheme } from '../types';
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  Check,
  Zap,
  Flame,
  Shield,
  HeartPulse,
  Eye,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';

interface ColorOption {
  id: ColorTheme;
  label: string;
  sublabel: string;
  badge: string;
  hex: string;
  gradient: string;
  borderClass: string;
  bgClass: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'cyan',
    label: 'Cyber Cyan',
    sublabel: 'High-Tech Biometrics & RFID',
    badge: 'Neon',
    hex: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    borderClass: 'border-cyan-500',
    bgClass: 'bg-cyan-500',
  },
  {
    id: 'sapphire',
    label: 'Sapphire Hospital',
    sublabel: 'Clinical Classic & EMR Care',
    badge: 'Standard',
    hex: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-500',
  },
  {
    id: 'emerald',
    label: 'Emerald Surgical',
    sublabel: 'Vital Signs, ICU & Recovery',
    badge: 'Clinical',
    hex: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-500',
  },
  {
    id: 'purple',
    label: 'Amethyst Pharma',
    sublabel: 'AI Automation & Genomics',
    badge: 'Biotech',
    hex: '#8b5cf6',
    gradient: 'from-purple-500 to-pink-600',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-500',
  },
  {
    id: 'amber',
    label: 'Amber Circadian',
    sublabel: 'Low-Strain & Ward Comfort',
    badge: 'Warm',
    hex: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500',
  },
  {
    id: 'crimson',
    label: 'Trauma Crimson',
    sublabel: 'Emergency Alert & Critical ER',
    badge: 'Acute',
    hex: '#f43f5e',
    gradient: 'from-rose-500 to-red-600',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-500',
  },
];

export const ThemeCustomizerBar: React.FC = () => {
  const { theme, setTheme, colorTheme, setColorTheme, activeTab } = useHospital();
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = PAGE_THEMES[activeTab] || PAGE_THEMES.dashboard;

  const activeColorObj = COLOR_OPTIONS.find((c) => c.id === colorTheme) || COLOR_OPTIONS[0];

  const handleSelectThemeMode = (mode: 'dark' | 'light') => {
    setTheme(mode);
    soundEffects.playCardScan();
  };

  const handleSelectColorTheme = (color: ColorTheme) => {
    setColorTheme(color);
    soundEffects.playSuccessChirp();
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-300 border shadow-sm ${
          theme === 'dark'
            ? 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            : 'bg-white/95 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-slate-100'
        }`}
        title="Theme & Medical Color Options"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shrink-0"
          style={{ backgroundColor: activeColorObj.hex }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden md:inline font-mono-tech text-[11px] text-slate-400">Theme:</span>
        <span className="capitalize font-mono-tech text-[11px] font-bold">
          {activeColorObj.label.split(' ')[0]} ({theme === 'dark' ? 'Dark' : '3D'})
        </span>
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop dismiss */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl p-4 z-50 border shadow-2xl backdrop-blur-2xl transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900/95 border-slate-800 text-white shadow-black/90'
                  : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl shadow-slate-200/80'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: activeColorObj.hex }}
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-tech tracking-wider uppercase">
                      Theme & Color Customizer
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Medical Dashboard & Hardware Atmosphere
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentTheme.name}
                </span>
              </div>

              {/* 1. Base Visual Mode */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-tech text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                    1. Visual Atmosphere
                  </span>
                  <span className="text-[10px] font-mono-tech text-cyan-500 dark:text-cyan-400">
                    {theme === 'dark' ? 'Night Mode Active' : 'Day Mode Active'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectThemeMode('light')}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                      theme === 'light'
                        ? 'bg-blue-50/80 border-blue-400 text-blue-800 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-slate-700 flex items-center justify-center">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-none">Neo-Clay 3D</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">Clinical Light</div>
                      </div>
                    </div>
                    {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleSelectThemeMode('dark')}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                      theme === 'dark'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
                        <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-none">Cyber Obsidian</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Telemetry Dark</div>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>
              </div>

              {/* 2. Medical Color Accent Palettes */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-tech text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                    2. Medical Color Accent Palette
                  </span>
                  <span className="text-[10px] font-mono-tech font-bold" style={{ color: activeColorObj.hex }}>
                    {activeColorObj.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = colorTheme === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectColorTheme(c.id)}
                        className={`p-2 rounded-xl border text-left transition-all relative flex items-center gap-2.5 ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-slate-800 border-white/40 ring-1 ring-white/30 shadow-md'
                              : 'bg-slate-50 border-slate-400 ring-1 ring-slate-300 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50'
                        }`}
                      >
                        {/* Swatch Circle */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shrink-0"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </div>

                        {/* Title & info */}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate leading-tight flex items-center justify-between">
                            <span className={isSelected ? 'text-white font-bold' : ''}>{c.label}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {c.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets Banner */}
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-2">
                <div className="text-[10px] uppercase font-mono-tech text-slate-500 dark:text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>One-Click Clinical Presets</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setTheme('dark');
                      setColorTheme('cyan');
                      soundEffects.playSuccessChirp();
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 border border-cyan-800/80 text-[10px] font-mono-tech text-cyan-300 text-center hover:bg-slate-800 transition"
                  >
                    Cyber Matrix
                  </button>
                  <button
                    onClick={() => {
                      setTheme('light');
                      setColorTheme('sapphire');
                      soundEffects.playSuccessChirp();
                    }}
                    className="p-1.5 rounded-lg bg-white border border-blue-300 text-[10px] font-mono-tech text-blue-700 text-center hover:bg-blue-50 transition"
                  >
                    Clean Clinic
                  </button>
                  <button
                    onClick={() => {
                      setTheme('dark');
                      setColorTheme('emerald');
                      soundEffects.playSuccessChirp();
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 border border-emerald-800/80 text-[10px] font-mono-tech text-emerald-300 text-center hover:bg-slate-800 transition"
                  >
                    Surgical ICU
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono-tech pt-1">
                <span>Auto-saved to local browser</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:text-slate-200 text-slate-400 font-semibold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
