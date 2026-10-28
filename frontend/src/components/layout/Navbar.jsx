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
    <header className="sticky top-0 z-40 bg-[#111B2B]/95 border-b border-[#29374B] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA]">
              <Fingerprint size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold tracking-wider text-base text-[#E5EDF7]">
                  CHITRAGUPTA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30 rounded">
                  FORENSIC AI
                </span>
              </div>
              <div className="text-[11px] text-[#77879D]">
                Cognitive Composite & Anatomical Verification Suite
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30 shadow-sm'
                        : 'text-[#A2B1C5] hover:text-[#E5EDF7] hover:bg-[#172337]'
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
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1120] border border-[#29374B] text-[11px]">
              <Radio
                size={12}
                className={isMockMode ? 'text-[#FBBF24] animate-pulse' : 'text-[#2DD4BF]'}
              />
              <span className="text-[#77879D]">Adapter:</span>
              <span className={isMockMode ? 'text-[#FBBF24] font-mono' : 'text-[#2DD4BF] font-mono'}>
                {isMockMode ? 'MOCK / DEMO' : 'LIVE FASTAPI'}
              </span>
            </div>

            {/* Officer Identification */}
            <div className="flex items-center gap-2.5 bg-[#172337] border border-[#29374B] px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-[#203049] flex items-center justify-center text-xs font-bold text-[#60A5FA] font-mono border border-[#29374B]">
                VR
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-[#E5EDF7] leading-tight flex items-center gap-1.5">
                  {officer.name}
                  <span className="text-[10px] font-mono text-[#60A5FA] font-normal">
                    [{officer.id}]
                  </span>
                </div>
                <div className="text-[10px] text-[#77879D] font-mono">
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

