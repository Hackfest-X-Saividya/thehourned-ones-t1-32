import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { exportForensicDossierPDF } from '../../utils/pdfExport';
import { FileDown, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PdfExportModal({ isOpen, onClose }) {
  const { officer, sessionId, caseNumber, finalizedSketch, recordAuditAction, addToast } = useSession();
  const [notes, setNotes] = useState(
    'Facial composite generated and verified under standard cognitive interview protocol for witness WIT-BLR-099.'
  );
  const [isExporting, setIsExporting] = useState(false);

  if (!finalizedSketch) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportForensicDossierPDF({
        caseNumber,
        sessionId,
        officerName: officer.name,
        officerId: officer.id,
        prompt: finalizedSketch.prompt,
        imageUrl: finalizedSketch.imageUrl,
        imageHash: finalizedSketch.imageHash,
        features: finalizedSketch.features,
        notes
      });
      await recordAuditAction(
        'EXPORTED_FORENSIC_DOSSIER_PDF',
        finalizedSketch.imageId,
        `Exported formal court dossier PDF for case ${caseNumber}`
      );
      addToast('Forensic Dossier PDF generated and downloaded.', 'success');
      onClose();
    } catch (err) {
      console.error('PDF export failed:', err);
      addToast('Failed to export PDF dossier. Please try again.', 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Court-Admissible Forensic Dossier (PDF)"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        <div className="flex gap-4 p-3 bg-[#0B1120] rounded-lg border border-[#29374B]">
          <img
            src={finalizedSketch.imageUrl}
            alt={finalizedSketch.imageId}
            className="w-24 h-24 rounded object-cover border border-[#29374B]"
          />
          <div className="space-y-1">
            <div className="font-mono text-[#60A5FA] font-bold">{caseNumber}</div>
            <div className="text-[11px] text-[#A2B1C5]">
              Composite Target: <strong className="font-mono text-[#E5EDF7]">{finalizedSketch.imageId}</strong> (v{finalizedSketch.iteration})
            </div>
            <div className="text-[10px] text-[#77879D] font-mono">
              Officer: {officer.name} [{officer.id}]
            </div>
            <div className="text-[10px] text-[#2DD4BF] font-mono">
              SHA-256 Ledger: Chained & Signed
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1">
            Investigating Officer Case Notes & Chain of Custody Addendum:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#0B1120] border border-[#29374B] rounded p-2 text-xs text-[#E5EDF7] placeholder:text-[#77879D] focus:outline-none focus:border-[#60A5FA] resize-none font-sans"
          />
        </div>

        <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/50 text-[10px] text-[#FBBF24]">
          <strong className="font-semibold text-[#FBBF24]">Legal Notice:</strong> The resulting dossier includes cryptographic SHA-256 signatures, anatomical attribute breakdowns, and non-conclusive investigative aid disclaimers in accordance with forensic reporting guidelines.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#29374B]">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            onClick={handleExport}
            isLoading={isExporting}
            icon={FileDown}
          >
            Export Dossier PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}

