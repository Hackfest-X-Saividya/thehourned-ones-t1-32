/**
 * Synthetic Criminal Records Demonstration Database.
 *
 * CRITICAL FORENSIC NOTICE:
 * All records, mugshot URLs, FIR numbers, similarity scores, and names below are SYNTHETIC
 * DEMONSTRATION DATA generated exclusively for hackathon evaluation and interface verification.
 * They do NOT represent real-world individuals, active police FIRs, or biometric identification.
 */

export const SYNTHETIC_CRIMINAL_REGISTRY = [
  {
    suspectId: 'CRIM-KA-2026-0912',
    fullName: 'Ramesh "Rocky" Shetty',
    alias: 'Rocky Bhai',
    firNumber: 'FIR-BLR-2024-882',
    jurisdiction: 'Bengaluru City (North Division)',
    crimeCategory: 'Armed Robbery & Extortion',
    priorOffenses: 'Armed Robbery (Sec 392 IPC, 2024), Extortion (Sec 384 IPC, 2025)',
    lastKnownLocation: 'Yelahanka / Hebbal Ring Road, Bengaluru',
    status: 'ACTIVE_WARRANT',
    gender: 'Male',
    age: 32,
    mugshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    baseVectorSimilarity: 91.4,
    features: {
      faceShape: 'Angular Oval',
      jawline: 'Sharp Square',
      eyes: 'Deep-set Almond',
      nose: 'Straight Narrow Bridge',
      facialHair: '3-Day Heavy Stubble',
      marks: 'Scar on Left Eyebrow',
      ageRange: '28-35'
    },
    biometricAudit: {
      registeredDate: '2024-04-12T10:30:00Z',
      fingerprintCode: 'AFIS-KA-99182',
      custodyStatus: 'At Large'
    }
  },
  {
    suspectId: 'CRIM-KA-2025-0441',
    fullName: 'Harish Gowda',
    alias: 'Auto Harish',
    firNumber: 'FIR-MYS-2023-119',
    jurisdiction: 'Mysuru Urban & Rural',
    crimeCategory: 'Vehicle Theft & Organized Gang',
    priorOffenses: 'Commercial Vehicle Theft (2023), Forgery of Documents (2024)',
    lastKnownLocation: 'Kengeri Satellite Town, Bengaluru',
    status: 'ON_BAIL',
    gender: 'Male',
    age: 35,
    mugshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    baseVectorSimilarity: 68.2,
    features: {
      faceShape: 'Angular Oval',
      jawline: 'Sharp Square',
      eyes: 'Deep-set Almond',
      nose: 'Broad Bridge',
      facialHair: 'Thick Horseshoe Mustache',
      marks: 'Mole on Right Cheek',
      ageRange: '32-38'
    },
    biometricAudit: {
      registeredDate: '2023-08-20T14:15:00Z',
      fingerprintCode: 'AFIS-KA-41029',
      custodyStatus: 'Periodic Police Station Check-in'
    }
  },
  {
    suspectId: 'CRIM-KA-2025-0778',
    fullName: 'Suresh Babu',
    alias: 'Blade Babu',
    firNumber: 'FIR-BLR-2025-304',
    jurisdiction: 'Bengaluru West Division',
    crimeCategory: 'Burglary & Trespassing',
    priorOffenses: 'Residential Night Burglary (2025)',
    lastKnownLocation: 'Yeshwanthpur Industrial Area, Bengaluru',
    status: 'ACTIVE_WARRANT',
    gender: 'Male',
    age: 41,
    mugshotUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    baseVectorSimilarity: 34.5,
    features: {
      faceShape: 'Round',
      jawline: 'Soft Rounded',
      eyes: 'Wide Round',
      nose: 'Bulbous Tip',
      facialHair: 'Clean Shaven',
      marks: 'None',
      ageRange: '40-48'
    },
    biometricAudit: {
      registeredDate: '2025-01-09T09:40:00Z',
      fingerprintCode: 'AFIS-KA-30114',
      custodyStatus: 'Evading Summons'
    }
  },
  {
    suspectId: 'CRIM-KA-2024-0319',
    fullName: 'Kiran "Shadow" Kumar',
    alias: 'Shadow',
    firNumber: 'FIR-BLR-2024-512',
    jurisdiction: 'Cyber Crime Police Station (CID)',
    crimeCategory: 'Cyber Fraud & ATM Skimming',
    priorOffenses: 'ATM Clone Device Installation (2024), Identity Theft (2024)',
    lastKnownLocation: 'Electronic City Phase 1, Bengaluru',
    status: 'INVESTIGATION_PENDING',
    gender: 'Male',
    age: 29,
    mugshotUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
    baseVectorSimilarity: 74.8,
    features: {
      faceShape: 'Angular Oval',
      jawline: 'Sharp Square',
      eyes: 'Narrow Hooded',
      nose: 'Straight Narrow Bridge',
      facialHair: 'Clean Shaven',
      marks: 'Birthmark near Right Temple',
      ageRange: '26-32'
    },
    biometricAudit: {
      registeredDate: '2024-09-18T16:00:00Z',
      fingerprintCode: 'AFIS-KA-55018',
      custodyStatus: 'Under Judicial Surveillance'
    }
  },
  {
    suspectId: 'CRIM-KA-2026-1102',
    fullName: 'Farhan "Dada" Ahmed',
    alias: 'Tiger Farhan',
    firNumber: 'FIR-MYS-2025-901',
    jurisdiction: 'Mangaluru Police Commissionerate',
    crimeCategory: 'Smuggling & Contraband',
    priorOffenses: 'Coastal Contraband Smuggling (2025)',
    lastKnownLocation: 'Bunder Port, Mangaluru',
    status: 'ACTIVE_WARRANT',
    gender: 'Male',
    age: 34,
    mugshotUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
    baseVectorSimilarity: 52.1,
    features: {
      faceShape: 'Square',
      jawline: 'Heavy Chiseled',
      eyes: 'Deep-set Almond',
      nose: 'Aquiline / Hooked',
      facialHair: 'Full Dense Beard',
      marks: 'Burn mark on neck',
      ageRange: '30-38'
    },
    biometricAudit: {
      registeredDate: '2025-11-04T11:20:00Z',
      fingerprintCode: 'AFIS-KA-80231',
      custodyStatus: 'Red Corner Alert (State)'
    }
  }
];

/**
 * Calculates comparative forensic match between a finalized sketch and a criminal record.
 * Uses a Dual-Metric Weighted Engine:
 * - 60% Weight: Biometric Vector Similarity (DeepFace / ArcFace simulation)
 * - 40% Weight: Structured Anatomical Feature Alignment
 */
export function calculateSuspectMatch(finalizedFeatures, criminalRecord) {
  if (!finalizedFeatures) return { combinedScore: 0, matchedTraits: [], featureScore: 0 };

  const featureKeys = ['faceShape', 'jawline', 'eyes', 'nose', 'facialHair', 'marks'];
  const matchedTraits = [];

  featureKeys.forEach((key) => {
    const sketchVal = (finalizedFeatures[key] || '').toLowerCase().trim();
    const crimVal = (criminalRecord.features?.[key] || '').toLowerCase().trim();

    if (sketchVal && crimVal) {
      if (sketchVal === crimVal) {
        matchedTraits.push(key);
      } else if (
        (sketchVal.includes('square') && crimVal.includes('square')) ||
        (sketchVal.includes('almond') && crimVal.includes('almond')) ||
        (sketchVal.includes('straight') && crimVal.includes('straight')) ||
        (sketchVal.includes('stubble') && crimVal.includes('stubble')) ||
        (sketchVal.includes('scar') && crimVal.includes('scar')) ||
        (sketchVal.includes('oval') && crimVal.includes('oval'))
      ) {
        matchedTraits.push(key);
      }
    }
  });

  const featureScore = (matchedTraits.length / featureKeys.length) * 100;
  const vectorScore = criminalRecord.baseVectorSimilarity || 50.0;
  const combinedScore = parseFloat((vectorScore * 0.6 + featureScore * 0.4).toFixed(1));

  let verdict = 'NO_MATCH';
  let verdictLabel = 'No Significant DB Match';
  let verdictColor = 'slate';

  if (combinedScore >= 75.0) {
    verdict = 'HIGH_CONFIDENCE_MATCH';
    verdictLabel = 'EXISTING CRIMINAL RECORD FOUND';
    verdictColor = 'emerald';
  } else if (combinedScore >= 50.0) {
    verdict = 'PARTIAL_MATCH';
    verdictLabel = 'PARTIAL / POSSIBLE MATCH';
    verdictColor = 'amber';
  } else {
    verdict = 'NEW_SUSPECT';
    verdictLabel = 'NO EXISTING RECORD (NEW SUSPECT)';
    verdictColor = 'slate';
  }

  return {
    combinedScore,
    vectorSimilarity: vectorScore,
    featureScore: parseFloat(featureScore.toFixed(1)),
    matchedTraits,
    totalTraitsCount: featureKeys.length,
    verdict,
    verdictLabel,
    verdictColor
  };
}
