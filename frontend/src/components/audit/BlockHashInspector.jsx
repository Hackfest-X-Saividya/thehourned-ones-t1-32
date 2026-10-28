import React, { useState } from 'react';
import { Copy, Check, Hash, ShieldCheck, Database, Key } from 'lucide-react';
import Badge from '../common/Badge';

export default function BlockHashInspector({ log }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const canonicalPayload = `${log.blockIndex}|${log.sessionId}|${log.memberId}|${log.action}|${log.imageId}|${log.timestamp}|${log.prevHash}`;

  return (
    <div className="p-4 bg-[#0B1120] border-t border-[#29374B] text-xs font-mono space-y-3">
      <div className="flex items-center justify-between text-[#A2B1C5]">
        <span className="font-semibold text-[#60A5FA] flex items-center gap-1.5">
          <Hash size={14} /> BLOCK #{log.blockIndex} CRYPTOGRAPHIC PAYLOAD INSPECTOR
        </span>
        <span className="text-[10px] text-[#2DD4BF] bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
          IMMUTABLE LEDGER NODE
        </span>
      </div>

      {/* Canonical Payload Serialized Message */}
      <div className="bg-[#111B2B] p-3 rounded-lg border border-[#29374B] space-y-1.5">
        <div className="text-[11px] text-[#A2B1C5] font-medium flex items-center justify-between">
          <span>Canonical Serialized Message String (Input to SHA-256):</span>
          <button
            onClick={() => copyToClipboard(canonicalPayload, 'payload')}
            className="text-[#77879D] hover:text-[#60A5FA] flex items-center gap-1 text-[11px] transition-colors"
          >
            {copiedField === 'payload' ? <Check size={11} className="text-[#2DD4BF]" /> : <Copy size={11} />}
            <span>{copiedField === 'payload' ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>
        <div className="text-[11px] text-[#E5EDF7] break-all bg-[#0B1120] p-2.5 rounded border border-[#29374B]">
          {canonicalPayload}
        </div>
      </div>

      {/* Hash Chaining Inspection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Previous Hash */}
        <div className="bg-[#111B2B] p-3 rounded-lg border border-[#29374B] space-y-1.5">
          <div className="text-[11px] text-[#A2B1C5] font-medium flex items-center justify-between">
            <span>Previous Block SHA-256 Pointer:</span>
            <button
              onClick={() => copyToClipboard(log.prevHash, 'prevHash')}
              className="text-[#77879D] hover:text-[#60A5FA] transition-colors"
            >
              {copiedField === 'prevHash' ? <Check size={11} className="text-[#2DD4BF]" /> : <Copy size={11} />}
            </button>
          </div>
          <div className="text-[11px] text-[#77879D] break-all bg-[#0B1120] p-2.5 rounded border border-[#29374B]">
            {log.prevHash}
          </div>
        </div>

        {/* Current Hash */}
        <div className="bg-[#111B2B] p-3 rounded-lg border border-teal-800/60 space-y-1.5">
          <div className="text-[11px] text-[#2DD4BF] font-medium flex items-center justify-between">
            <span>Current Block SHA-256 Digest:</span>
            <button
              onClick={() => copyToClipboard(log.currHash, 'currHash')}
              className="text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors"
            >
              {copiedField === 'currHash' ? <Check size={11} className="text-[#2DD4BF]" /> : <Copy size={11} />}
            </button>
          </div>
          <div className="text-[11px] text-[#2DD4BF] break-all bg-[#0B1120] p-2.5 rounded border border-teal-800/40 font-semibold">
            {log.currHash}
          </div>
        </div>
      </div>

      {/* Metadata Detail */}
      <div className="text-[11px] text-[#77879D] bg-[#111B2B] p-2.5 rounded-lg border border-[#29374B] flex items-center justify-between">
        <span>Recorded Action Context: <strong className="text-[#E5EDF7] font-medium">{log.metadata || 'Standard forensic session operation'}</strong></span>
        <span className="text-[10px] text-[#77879D]">Case Ref: {log.caseNumber || 'N/A'}</span>
      </div>
    </div>
  );
}

