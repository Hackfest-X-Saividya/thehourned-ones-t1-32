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
    <div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-5 space-y-4 shadow-sm">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA] shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#E5EDF7] tracking-wide flex items-center gap-2">
              <span>Tamper-Proof Blockchain Audit Ledger</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-950/60 text-[#60A5FA] border border-blue-800/60 rounded">
                SHA-256 PROOF-OF-CUSTODY
              </span>
            </h1>
            <p className="text-xs text-[#A2B1C5] mt-0.5">
              Cryptographically chains every member access, prompt generation, image refinement, and
              database query to ensure forensic chain-of-custody compliance.
            </p>
          </div>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-2">
          {verificationResult.isValid ? (
            <div className="flex items-center gap-2 bg-teal-950/60 border border-teal-800/60 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#2DD4BF]">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>CHAIN INTEGRITY VERIFIED ({auditLogs.length} BLOCKS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-800/70 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#F87171] animate-pulse">
              <AlertTriangle size={16} className="text-[#F87171]" />
              <span>TAMPER DETECTED AT BLOCK #{verificationResult.corruptedBlockIndex}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics & Action Bar */}
      <div className="pt-3.5 border-t border-[#29374B] flex flex-wrap items-center justify-between gap-4">
        {/* Quick Metrics */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="bg-[#0B1120] px-3 py-1.5 rounded-lg border border-[#29374B]">
            <span className="text-[#77879D]">TOTAL BLOCKS:</span>{' '}
            <span className="text-[#60A5FA] font-semibold">{auditLogs.length}</span>
          </div>
          <div className="bg-[#0B1120] px-3 py-1.5 rounded-lg border border-[#29374B]">
            <span className="text-[#77879D]">ALGORITHM:</span>{' '}
            <span className="text-[#E5EDF7]">SHA-256</span>
          </div>
          <div className="bg-[#0B1120] px-3 py-1.5 rounded-lg border border-[#29374B]">
            <span className="text-[#77879D]">CUSTODY STATUS:</span>{' '}
            <span className={verificationResult.isValid ? 'text-[#2DD4BF] font-semibold' : 'text-[#F87171] font-semibold'}>
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
              className="text-[#FBBF24] hover:text-amber-300"
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
        <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg text-xs text-[#F87171] flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-[#F87171] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Forensic Integrity Alert:</strong> {verificationResult.reason}. Unauthorized
            alteration of audit history breaks downstream SHA-256 hashes.
          </div>
        </div>
      )}
    </div>
  );
}

