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
    <div className="p-4 bg-navy-950 border-t border-slate-800 text-xs font-mono space-y-3">
      <div className="flex items-center justify-between text-slate-300">
        <span className="font-bold text-sky-400 flex items-center gap-1.5">
          <Hash size={14} /> BLOCK #{log.blockIndex} CRYPTOGRAPHIC PAYLOAD INSPECTOR
        </span>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          IMMUTABLE LEDGER NODE
        </span>
      </div>

      {/* Canonical Payload Serialized Message */}
      <div className="bg-navy-900 p-2.5 rounded border border-slate-800 space-y-1">
        <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center justify-between">
          <span>Canonical Serialized Message String (Input to SHA-256):</span>
          <button
            onClick={() => copyToClipboard(canonicalPayload, 'payload')}
            className="text-slate-400 hover:text-sky-300 flex items-center gap-1 text-[10px]"
          >
            {copiedField === 'payload' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copiedField === 'payload' ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-300 break-all bg-navy-950 p-2 rounded border border-slate-850">
          {canonicalPayload}
        </div>
      </div>

      {/* Hash Chaining Inspection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Previous Hash */}
        <div className="bg-navy-900 p-2.5 rounded border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Previous Block SHA-256 Pointer:</span>
            <button
              onClick={() => copyToClipboard(log.prevHash, 'prevHash')}
              className="text-slate-400 hover:text-sky-300"
            >
              {copiedField === 'prevHash' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          </div>
          <div className="text-[11px] text-slate-400 break-all bg-navy-950 p-2 rounded border border-slate-850">
            {log.prevHash}
          </div>
        </div>

        {/* Current Hash */}
        <div className="bg-navy-900 p-2.5 rounded border border-emerald-900/60 space-y-1">
          <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center justify-between">
            <span>Current Block SHA-256 Digest:</span>
            <button
              onClick={() => copyToClipboard(log.currHash, 'currHash')}
              className="text-emerald-400 hover:text-emerald-200"
            >
              {copiedField === 'currHash' ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} />}
            </button>
          </div>
          <div className="text-[11px] text-emerald-300 break-all bg-navy-950 p-2 rounded border border-emerald-900/40 font-bold">
            {log.currHash}
          </div>
        </div>
      </div>

      {/* Metadata Detail */}
      <div className="text-[11px] text-slate-400 bg-navy-900 p-2 rounded border border-slate-800 flex items-center justify-between">
        <span>Recorded Action Context: <strong className="text-slate-200">{log.metadata || 'Standard forensic session operation'}</strong></span>
        <span className="text-[10px] text-slate-500">Case Ref: {log.caseNumber || 'N/A'}</span>
      </div>
    </div>
  );
}
