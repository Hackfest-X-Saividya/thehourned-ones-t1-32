import React from 'react';
import BlockchainStatusHeader from '../components/audit/BlockchainStatusHeader';
import AuditLogTable from '../components/audit/AuditLogTable';
import { Lock, ShieldCheck, History, Layers } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#E5EDF7] tracking-wide flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#60A5FA]" />
            <span>Forensic Custody Ledger & Access Audit History</span>
          </h1>
          <p className="text-xs text-[#A2B1C5] mt-0.5">
            Cryptographic proof-of-custody logging utilizing SHA-256 block hashing across session
            events, image generations, and database queries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#77879D]">CHAIN PROTOCOL:</span>
          <span className="text-[#2DD4BF] font-semibold bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-lg">
            SHA-256 HASH CHAIN
          </span>
        </div>
      </div>

      {/* Forensic Audit Architecture Clarification Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-[#60A5FA] font-mono text-[11px] uppercase">
            <Lock size={13} />
            <span>1. Access Audit History</span>
          </div>
          <p className="text-[11px] text-[#A2B1C5] leading-relaxed">
            Records which officer ID logged in, initiated witness interviews, and exported dossiers,
            establishing who interacted with case data.
          </p>
        </div>

        <div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-[#2DD4BF] font-mono text-[11px] uppercase">
            <History size={13} />
            <span>2. Image Revision History</span>
          </div>
          <p className="text-[11px] text-[#A2B1C5] leading-relaxed">
            Tracks parent-to-child composite tree mutations, seeds, witness prompt deltas, and anatomical
            refinements across iterations v1 to vN.
          </p>
        </div>

        <div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-[#60A5FA] font-mono text-[11px] uppercase">
            <Layers size={13} />
            <span>3. Cryptographic Verification</span>
          </div>
          <p className="text-[11px] text-[#A2B1C5] leading-relaxed">
            Each block's hash seals the preceding block's hash. Any modification to past entries
            breaks downstream cryptographic links instantaneously.
          </p>
        </div>
      </div>

      {/* Blockchain Status & Integrity Verification Header */}
      <BlockchainStatusHeader />

      {/* Main Filterable Audit Table */}
      <AuditLogTable />
    </div>
  );
}
