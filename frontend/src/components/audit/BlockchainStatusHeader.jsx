import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { verifyAuditChain } from '../../utils/hashUtils';
import { Lock, CheckCircle2, AlertTriangle, RefreshCw, Bug, ShieldAlert, Cpu } from 'lucide-react';
import Button from '../common/Button';

export default function BlockchainStatusHeader() {
  const { auditLogs, simulateTamper, restoreChainIntegrity, addToast } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState({
    isValid: true,
    corruptedBlockIndex: null,
    reason: 'Initial cryptographic state intact.'
  });

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyAuditChain(auditLogs);
      setVerificationResult(res);
      if (res.isValid) {
        addToast(`Ledger integrity confirmed: All ${auditLogs.length} blocks verified via SHA-256.`, 'success');
      } else {
        addToast(res.reason, 'danger', 6000);
      }
    } catch (err) {
      console.error(err);
      addToast('Verification error encountered.', 'danger');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamperClick = () => {
    if (auditLogs.length > 1) {
      simulateTamper(2);
      // Immediately run verification check to demonstrate real-time detection
      setTimeout(async () => {
        const res = await verifyAuditChain(auditLogs);
        setVerificationResult(res);
      }, 200);
    }
  };

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>Tamper-Proof Blockchain Audit Ledger</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded">
                SHA-256 PROOF-OF-CUSTODY
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically chains every member access, prompt generation, image refinement, and
              database query to ensure forensic chain-of-custody compliance.
            </p>
          </div>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-2">
          {verificationResult.isValid ? (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/60 px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-300">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>CHAIN INTEGRITY VERIFIED ({auditLogs.length} BLOCKS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-rose-950/90 border border-rose-500/80 px-3.5 py-2 rounded-lg text-xs font-bold text-rose-300 animate-pulse">
              <AlertTriangle size={16} className="text-rose-400" />
              <span>TAMPER DETECTED AT BLOCK #{verificationResult.corruptedBlockIndex}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics & Action Bar */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Quick Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="bg-navy-950 px-3 py-1.5 rounded border border-slate-850">
            <span className="text-slate-500">TOTAL BLOCKS:</span>{' '}
            <span className="text-sky-400 font-bold">{auditLogs.length}</span>
          </div>
          <div className="bg-navy-950 px-3 py-1.5 rounded border border-slate-850">
            <span className="text-slate-500">ALGORITHM:</span>{' '}
            <span className="text-slate-300">SHA-256</span>
          </div>
          <div className="bg-navy-950 px-3 py-1.5 rounded border border-slate-850">
            <span className="text-slate-500">CUSTODY STATUS:</span>{' '}
            <span className={verificationResult.isValid ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
              {verificationResult.isValid ? 'SECURE' : 'COMPROMISED'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerify}
            isLoading={isVerifying}
            icon={RefreshCw}
          >
            Verify Chain Cryptography
          </Button>

          {verificationResult.isValid ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSimulateTamperClick}
              icon={Bug}
              className="text-amber-400 hover:text-amber-300"
              title="Demonstrates client-side tamper detection"
            >
              Simulate Block Tamper (Demo)
            </Button>
          ) : (
            <Button
              variant="emerald"
              size="sm"
              onClick={restoreChainIntegrity}
              icon={CheckCircle2}
            >
              Restore & Re-Hash Chain
            </Button>
          )}
        </div>
      </div>

      {!verificationResult.isValid && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg text-xs text-rose-200 flex items-start gap-2">
          <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong>Forensic Integrity Alert:</strong> {verificationResult.reason}. Unauthorized
            alteration of audit history breaks downstream SHA-256 hashes.
          </div>
        </div>
      )}
    </div>
  );
}
