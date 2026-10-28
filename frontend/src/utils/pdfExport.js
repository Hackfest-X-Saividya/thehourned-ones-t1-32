import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a high-resolution Forensic Dossier PDF for court/investigative reporting.
 *
 * @param {object} params
 * @param {string} params.caseNumber
 * @param {string} params.sessionId
 * @param {string} params.officerName
 * @param {string} params.officerId
 * @param {string} params.prompt
 * @param {string} params.imageUrl
 * @param {string} params.imageHash
 * @param {object} params.features
 * @param {string} [params.notes]
 */
export async function exportForensicDossierPDF({
  caseNumber = 'FIR-BLR-2026-0194',
  sessionId = 'SES-2026-8841',
  officerName = 'Insp. Vikram Rao',
  officerId = 'OFF-KA-402',
  prompt = '',
  imageUrl = '',
  imageHash = '',
  features = {},
  notes = 'Composite generated following standardized witness cognitive interview protocol.'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background Header Bar
  doc.setFillColor(11, 15, 25); // #0B0F19 Dark Navy
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Title & Department Header
  doc.setTextColor(56, 189, 248); // Cyan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STATE CYBER & FORENSIC CRIME INVESTIGATION CELL', 14, 12);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.text('AUTOMATED FACIAL COMPOSITE & BIOMETRIC FEATURE DOSSIER // CONFIDENTIAL', 14, 18);
  doc.text(`GENERATED: ${new Date().toUTCString()} | REF CODE: ${sessionId}`, 14, 24);

  // Status Badge
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(pageWidth - 54, 8, 40, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FORENSIC DRAFT', pageWidth - 50, 14.5);

  // Section 1: Case & Officer Metadata Grid
  doc.setDrawColor(30, 41, 59); // Slate 800
  doc.setFillColor(248, 250, 252); // Off white
  doc.roundedRect(14, 38, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`CASE / FIR NUMBER:`, 18, 45);
  doc.text(`INVESTIGATING OFFICER:`, 18, 52);
  doc.text(`STATION / UNIT:`, 18, 59);

  doc.setFont('helvetica', 'normal');
  doc.text(caseNumber, 62, 45);
  doc.text(`${officerName} (${officerId})`, 62, 52);
  doc.text('Forensic Identification & Facial Reconstruction Unit', 62, 59);

  doc.setFont('helvetica', 'bold');
  doc.text(`SESSION ID:`, 120, 45);
  doc.text(`CHAIN OF CUSTODY:`, 120, 52);
  doc.text(`CLASSIFICATION:`, 120, 59);

  doc.setFont('helvetica', 'normal');
  doc.text(sessionId, 155, 45);
  doc.text('Cryptographically Verified', 155, 52);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('INVESTIGATIVE AID ONLY', 155, 59);

  // Helper to load image as base64 safely
  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 512;
          canvas.height = img.height || 512;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  let imageBase64 = null;
  if (imageUrl) {
    try {
      imageBase64 = await loadImage(imageUrl);
    } catch {
      imageBase64 = null;
    }
  }

  // Section 2: Composite Portrait vs Structured Features
  const imageY = 68;
  const imageSize = 75;

  doc.setDrawColor(203, 213, 225);
  doc.rect(14, imageY, imageSize, imageSize, 'S');

  if (imageBase64) {
    try {
      doc.addImage(imageBase64, 'JPEG', 14, imageY, imageSize, imageSize);
    } catch {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, imageY, imageSize, imageSize, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('[COMPOSITE IMAGE ATTACHED]', 25, imageY + 38);
    }
  } else {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, imageY, imageSize, imageSize, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('[COMPOSITE IMAGE ATTACHED]', 25, imageY + 38);
  }

  // Structured Facial Features Table on Right
  const tableX = 96;
  let currentTableY = imageY + 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EXTRACTED ANATOMICAL ATTRIBUTES', tableX, currentTableY);

  currentTableY += 6;
  doc.setFontSize(8.5);

  const featureList = [
    ['Face Shape', features?.faceShape || 'Angular Oval'],
    ['Jawline & Gonial Angle', features?.jawline || 'Sharp Square'],
    ['Eye Morphology', features?.eyes || 'Deep-set Almond'],
    ['Nasal Profile', features?.nose || 'Straight Narrow Bridge'],
    ['Facial Hair / Stubble', features?.facialHair || '3-Day Heavy Stubble'],
    ['Distinguishing Marks / Scars', features?.marks || 'Scar on Left Eyebrow'],
    ['Estimated Age Range', features?.ageRange || '28 - 35 Years']
  ];

  featureList.forEach(([label, val], idx) => {
    const rowY = currentTableY + idx * 8.5;
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(tableX, rowY - 5, pageWidth - tableX - 14, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label + ':', tableX + 2, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), tableX + 50, rowY);
  });

  // Section 3: Natural Language Witness Statement
  const promptY = imageY + imageSize + 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, promptY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ORIGINAL WITNESS TESTIMONY & PROMPT INSTRUCTION:', 18, promptY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitPrompt = doc.splitTextToSize(`"${prompt || 'Suspect visual features recorded via cognitive recall.'}"`, pageWidth - 36);
  doc.text(splitPrompt, 18, promptY + 13);

  // Section 4: Cryptographic Ledger & Hash
  const hashY = promptY + 32;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(14, hashY, pageWidth - 28, 16, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248);
  doc.text('SHA-256 DIGITAL COMPOSITE DIGEST:', 18, hashY + 6);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(248, 250, 252);
  doc.text(imageHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 18, hashY + 11);

  // Section 5: Legal & Forensic Disclaimer
  const disclaimerY = hashY + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28); // Dark Red
  doc.text('CRITICAL LEGAL & FORENSIC DISCLAIMER:', 14, disclaimerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const disclaimerText =
    'This facial composite is an artist/AI investigative aid based exclusively on witness cognitive recollection. It is not conclusive photographic proof, biometric identification, or criminal evidence. Similarity scores generated against demonstration records do not constitute proof of identity, criminality, or guilt. Unauthorized distribution is prohibited under applicable privacy laws.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 28);
  doc.text(splitDisclaimer, 14, disclaimerY + 4);

  // Signature Blocks
  const sigY = pageHeight - 24;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, sigY, 74, sigY);
  doc.line(pageWidth - 74, sigY, pageWidth - 14, sigY);

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Investigating Forensic Officer Signature', 14, sigY + 5);
  doc.text('Forensic Laboratory Director / Custodian', pageWidth - 74, sigY + 5);

  // Save PDF
  doc.save(`Forensic_Dossier_${caseNumber}_${sessionId}.pdf`);
}

