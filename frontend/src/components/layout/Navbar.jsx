import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import {
  Compass,
  Database,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Radio,
  FileCheck2
} from 'lucide-react';
import Badge from '../common/Badge';

export default function Navbar() {
  const { officer, sessionId, caseNumber } = useSession();
  const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  const navItems = [
    {
      to: '/',
      label: 'Image Gen Studio',
      icon: Compass,
      description: 'Flow-based composite sketch workspace'
    },
    {
      to: '/db-verification',
      label: 'Feature Comparison',
      icon: Database,
      description: 'Criminal record anatomical alignment'
    },
    {
      to: '/audit-logs',
      label: 'Audit Ledger',
      icon: ShieldCheck,
      description: 'Cryptographic SHA-256 access logs'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Fingerprint size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold tracking-wider text-base text-white">
                  CHITRAGUPTA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded">
                  FORENSIC AI
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Cognitive Composite & Anatomical Verification Suite
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
                    }`
                  }
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Officer & Mode Badges */}
          <div className="flex items-center gap-3">
            {/* Adapter Mode Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-950 border border-slate-800 text-[11px]">
              <Radio
                size={12}
                className={isMockMode ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}
              />
              <span className="text-slate-400">Adapter:</span>
              <span className={isMockMode ? 'text-amber-300 font-mono' : 'text-emerald-300 font-mono'}>
                {isMockMode ? 'MOCK / DEMO' : 'LIVE FASTAPI'}
              </span>
            </div>

            {/* Officer Identification */}
            <div className="flex items-center gap-2.5 bg-navy-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 font-mono border border-slate-600">
                VR
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                  {officer.name}
                  <span className="text-[10px] font-mono text-sky-400 font-normal">
                    [{officer.id}]
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {officer.unit}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
