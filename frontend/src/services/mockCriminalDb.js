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

/**
 * High-tech forensic SVG mugshot fallback avatar with police calibration markers.
 */
export function getMugshotFallback(gender = 'Male', seed = '1') {
  const isFemale = String(gender).toLowerCase() === 'female';
  const strokeColor = '#38BDF8';
  const faceFill = '#1E293B';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#060A12"/>
    <defs>
      <pattern id="fgrid" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#0F172A" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#fgrid)"/>
    <!-- Police Height Scale Marks -->
    <line x1="8" y1="30" x2="24" y2="30" stroke="#38BDF8" stroke-width="1" opacity="0.3"/>
    <line x1="8" y1="55" x2="28" y2="55" stroke="#38BDF8" stroke-width="1.2" opacity="0.5"/>
    <line x1="8" y1="80" x2="24" y2="80" stroke="#38BDF8" stroke-width="1" opacity="0.3"/>
    <line x1="8" y1="105" x2="28" y2="105" stroke="#38BDF8" stroke-width="1.2" opacity="0.5"/>
    <line x1="8" y1="130" x2="24" y2="130" stroke="#38BDF8" stroke-width="1" opacity="0.3"/>
    <text x="32" y="58" fill="#475569" font-family="monospace" font-size="7">6'0"</text>
    <text x="32" y="108" fill="#475569" font-family="monospace" font-size="7">5'6"</text>
    <!-- Shoulders & Torso -->
    <path d="M 35 195 C 40 148 65 132 100 132 C 135 132 160 148 165 195 Z" fill="${faceFill}" stroke="#334155" stroke-width="2"/>
    <!-- Neck -->
    <rect x="88" y="112" width="24" height="26" fill="#152033" stroke="#334155" stroke-width="1.5"/>
    <!-- Head & Jawline -->
    <ellipse cx="100" cy="78" rx="36" ry="46" fill="#0F172A" stroke="${strokeColor}" stroke-width="1.8"/>
    <!-- Eyes -->
    <ellipse cx="86" cy="74" rx="5" ry="3" fill="#38BDF8"/>
    <ellipse cx="114" cy="74" rx="5" ry="3" fill="#38BDF8"/>
    <!-- Nose bridge -->
    <path d="M 100 72 L 98 88 L 104 89" fill="none" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Mouth / Stubble -->
    <path d="M 88 102 Q 100 106 112 102" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
    ${
      !isFemale
        ? '<path d="M 82 92 Q 100 118 118 92" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="1.5,2.5" opacity="0.6"/>'
        : ''
    }
    <!-- Eyebrows & Forehead -->
    <path d="M 80 66 Q 87 63 94 66" fill="none" stroke="#94A3B8" stroke-width="2"/>
    <path d="M 106 66 Q 113 63 120 66" fill="none" stroke="#94A3B8" stroke-width="2"/>
    <!-- Forensic Crosshairs -->
    <circle cx="100" cy="78" r="2.5" fill="#EF4444"/>
    <line x1="88" y1="78" x2="112" y2="78" stroke="#EF4444" stroke-width="0.8" stroke-dasharray="2,2"/>
    <line x1="100" y1="66" x2="100" y2="90" stroke="#EF4444" stroke-width="0.8" stroke-dasharray="2,2"/>
    <!-- ID Footer Plate -->
    <rect x="25" y="174" width="150" height="18" rx="3" fill="#030712" stroke="#334155" stroke-width="1"/>
    <text x="100" y="186" fill="#94A3B8" font-family="monospace" font-size="8.5" text-anchor="middle" font-weight="bold">AFIS-CRIM-ID-${String(seed).slice(-6)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Specialized Law Enforcement Datasets available for instant 1-click loading.
 */
export const SAMPLE_CUSTOM_DATASETS = {
  STATE_SPECIAL_TASKFORCE: {
    name: 'Karnataka State Special Taskforce Fugitives',
    description: 'High-priority wanted robbery, extortion, and assault offenders across Karnataka divisions.',
    records: [
      {
        suspectId: 'CUST-TF-2026-001',
        fullName: 'Vikram "Vicky" Hegde',
        alias: 'Vicky Bhai',
        firNumber: 'FIR-BLR-2025-412',
        jurisdiction: 'Indiranagar PS (East Division)',
        crimeCategory: 'Armed Assault & Extortion',
        priorOffenses: 'Assault with Deadly Weapon (2024), Extortion Syndicate (2025)',
        lastKnownLocation: 'Old Airport Road / Domlur, Bengaluru',
        status: 'ACTIVE_WARRANT',
        gender: 'Male',
        age: 33,
        mugshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 92.8,
        features: {
          faceShape: 'Angular Oval',
          jawline: 'Sharp Square',
          eyes: 'Deep-set Almond',
          nose: 'Straight Narrow Bridge',
          facialHair: '3-Day Heavy Stubble',
          marks: 'Scar on Left Eyebrow',
          ageRange: '28-35'
        }
      },
      {
        suspectId: 'CUST-TF-2026-002',
        fullName: 'Anand "Bullet" Kumar',
        alias: 'Bullet Anand',
        firNumber: 'FIR-BLR-2024-910',
        jurisdiction: 'Ulsoor Police Station',
        crimeCategory: 'Commercial Robbery & Gang Enforcer',
        priorOffenses: 'Jewelry Store Armed Robbery (2024)',
        lastKnownLocation: 'Shivajinagar Bus Terminal, Bengaluru',
        status: 'ACTIVE_WARRANT',
        gender: 'Male',
        age: 31,
        mugshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 88.5,
        features: {
          faceShape: 'Angular Oval',
          jawline: 'Sharp Square',
          eyes: 'Deep-set Almond',
          nose: 'Straight Narrow Bridge',
          facialHair: '3-Day Heavy Stubble',
          marks: 'Burn mark on neck',
          ageRange: '28-35'
        }
      },
      {
        suspectId: 'CUST-TF-2026-003',
        fullName: 'Karthik Gowda',
        alias: 'Kari Karthik',
        firNumber: 'FIR-MYS-2025-102',
        jurisdiction: 'Mysuru City Crime Branch',
        crimeCategory: 'Interstate Drug Smuggling',
        priorOffenses: 'NDPS Act Sec 21 (2023), Illegal Firearm Possession (2025)',
        lastKnownLocation: 'Mandya Highway Toll Plaza',
        status: 'INVESTIGATION_PENDING',
        gender: 'Male',
        age: 36,
        mugshotUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 71.4,
        features: {
          faceShape: 'Square',
          jawline: 'Heavy Chiseled',
          eyes: 'Narrow Hooded',
          nose: 'Broad Bridge',
          facialHair: 'Full Dense Beard',
          marks: 'Mole on Right Cheek',
          ageRange: '32-38'
        }
      },
      {
        suspectId: 'CUST-TF-2026-004',
        fullName: 'Imran "Tiger" Khan',
        alias: 'Tiger Khan',
        firNumber: 'FIR-HUB-2024-554',
        jurisdiction: 'Hubballi-Dharwad Commissionerate',
        crimeCategory: 'Organized Vehicle Theft Syndicate',
        priorOffenses: 'Inter-district Heavy Vehicle Hijacking (2024)',
        lastKnownLocation: 'Gokul Road Industrial Estate, Hubballi',
        status: 'ON_BAIL',
        gender: 'Male',
        age: 39,
        mugshotUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 58.6,
        features: {
          faceShape: 'Round',
          jawline: 'Soft Rounded',
          eyes: 'Wide Round',
          nose: 'Bulbous Tip',
          facialHair: 'Thick Horseshoe Mustache',
          marks: 'None',
          ageRange: '38-45'
        }
      },
      {
        suspectId: 'CUST-TF-2026-005',
        fullName: 'Rajesh "Blade" Poojary',
        alias: 'Mangaluru Blade',
        firNumber: 'FIR-MNG-2025-881',
        jurisdiction: 'Mangaluru South Division',
        crimeCategory: 'Contract Violence & Extortion',
        priorOffenses: 'Extortion from Coastal Port Traders (2025)',
        lastKnownLocation: 'Panambur Port Area, Mangaluru',
        status: 'ACTIVE_WARRANT',
        gender: 'Male',
        age: 34,
        mugshotUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 82.1,
        features: {
          faceShape: 'Angular Oval',
          jawline: 'Sharp Square',
          eyes: 'Deep-set Almond',
          nose: 'Straight Narrow Bridge',
          facialHair: 'Clean Shaven',
          marks: 'Scar on Left Eyebrow',
          ageRange: '28-35'
        }
      }
    ]
  },

  METRO_ROBBERY_CELL: {
    name: 'Bengaluru Metro Robbery & Organized Extortion Roster',
    description: 'Active commercial robbery, bank ATM heist, and weapon extortion offenders.',
    records: [
      {
        suspectId: 'ROB-BLR-101',
        fullName: 'Ramesh "Rocky" Shetty',
        alias: 'Rocky Bhai',
        firNumber: 'FIR-BLR-2024-882',
        jurisdiction: 'Bengaluru North Division',
        crimeCategory: 'Armed Robbery & Extortion',
        priorOffenses: 'Armed Robbery (Sec 392 IPC, 2024), Extortion (Sec 384 IPC, 2025)',
        lastKnownLocation: 'Yelahanka / Hebbal Ring Road, Bengaluru',
        status: 'ACTIVE_WARRANT',
        gender: 'Male',
        age: 32,
        mugshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 94.2,
        features: {
          faceShape: 'Angular Oval',
          jawline: 'Sharp Square',
          eyes: 'Deep-set Almond',
          nose: 'Straight Narrow Bridge',
          facialHair: '3-Day Heavy Stubble',
          marks: 'Scar on Left Eyebrow',
          ageRange: '28-35'
        }
      },
      {
        suspectId: 'ROB-BLR-102',
        fullName: 'Dinesh "Dada" Nayak',
        alias: 'Hebbal Dada',
        firNumber: 'FIR-BLR-2025-199',
        jurisdiction: 'Hebbal Police Station',
        crimeCategory: 'Highway Robbery & Smuggling',
        priorOffenses: 'Highway Truck Loot (2024), Illegal Arms (2025)',
        lastKnownLocation: 'Hebbal Flyover / Bellary Road',
        status: 'ACTIVE_WARRANT',
        gender: 'Male',
        age: 30,
        mugshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 89.0,
        features: {
          faceShape: 'Angular Oval',
          jawline: 'Sharp Square',
          eyes: 'Deep-set Almond',
          nose: 'Straight Narrow Bridge',
          facialHair: '3-Day Heavy Stubble',
          marks: 'Birthmark near Right Temple',
          ageRange: '28-35'
        }
      },
      {
        suspectId: 'ROB-BLR-103',
        fullName: 'Deepak "Chinnu" Salian',
        alias: 'Chinnu',
        firNumber: 'FIR-BLR-2023-741',
        jurisdiction: 'Malleshwaram Division',
        crimeCategory: 'Gold Snatching & Daylight Robbery',
        priorOffenses: 'Chain Snatching (2023)',
        lastKnownLocation: 'Rajajinagar 1st Block',
        status: 'ON_BAIL',
        gender: 'Male',
        age: 27,
        mugshotUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
        baseVectorSimilarity: 64.0,
        features: {
          faceShape: 'Angular Oval',
          jawline: 'Soft Rounded',
          eyes: 'Narrow Hooded',
          nose: 'Straight Narrow Bridge',
          facialHair: 'Clean Shaven',
          marks: 'None',
          ageRange: '25-30'
        }
      }
    ]
  }
};

/**
 * Parses suspect records from user-supplied CSV string.
 */
export function parseSuspectsFromCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim());
    if (row.length < 2 || !row[0]) continue;

    const getCol = (key) => {
      const idx = headers.indexOf(key.toLowerCase());
      return idx >= 0 && row[idx] ? row[idx] : '';
    };

    const id = getCol('suspectid') || getCol('id') || `CUST-ID-${Date.now().toString().slice(-4)}-${i}`;
    const fullName = getCol('fullname') || getCol('name') || `Suspect Record #${i}`;
    const alias = getCol('alias') || '';
    const firNumber = getCol('firnumber') || getCol('fir') || `FIR-CUST-${i}`;
    const jurisdiction = getCol('jurisdiction') || 'Jurisdiction Registry';
    const crimeCategory = getCol('crimecategory') || getCol('crime') || 'Investigative Record';
    const priorOffenses = getCol('prioroffenses') || getCol('offenses') || 'Under Active Investigation';
    const lastKnownLocation = getCol('lastknownlocation') || getCol('location') || 'State Jurisdiction';
    const status = getCol('status') || 'ACTIVE_WARRANT';
    const gender = getCol('gender') || 'Male';
    const age = parseInt(getCol('age'), 10) || 30;
    const mugshotUrl = getCol('mugshoturl') || getCol('photo') || getMugshotFallback(gender, id);

    const features = {
      faceShape: getCol('faceshape') || 'Angular Oval',
      jawline: getCol('jawline') || 'Sharp Square',
      eyes: getCol('eyes') || 'Deep-set Almond',
      nose: getCol('nose') || 'Straight Narrow Bridge',
      facialHair: getCol('facialhair') || '3-Day Heavy Stubble',
      marks: getCol('marks') || 'None',
      ageRange: getCol('agerange') || `${age - 3}-${age + 4}`
    };

    records.push({
      suspectId: id,
      fullName,
      alias,
      firNumber,
      jurisdiction,
      crimeCategory,
      priorOffenses,
      lastKnownLocation,
      status,
      gender,
      age,
      mugshotUrl,
      baseVectorSimilarity: parseFloat((70 + (Math.random() * 25)).toFixed(1)),
      features
    });
  }

  return records;
}

/**
 * Validates and normalizes suspect records from user-supplied JSON.
 */
export function parseSuspectsFromJson(jsonText) {
  if (!jsonText) return [];
  const parsed = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
  const list = Array.isArray(parsed) ? parsed : parsed.records || [parsed];

  return list.map((item, idx) => {
    const gender = item.gender || 'Male';
    const id = item.suspectId || item.id || `CUST-${Date.now().toString().slice(-4)}-${idx + 1}`;
    return {
      suspectId: id,
      fullName: item.fullName || item.name || `Suspect ${idx + 1}`,
      alias: item.alias || '',
      firNumber: item.firNumber || item.fir || `FIR-CUSTOM-${idx + 1}`,
      jurisdiction: item.jurisdiction || 'Department Records',
      crimeCategory: item.crimeCategory || item.category || 'General Criminal Record',
      priorOffenses: item.priorOffenses || 'Recorded in Police File',
      lastKnownLocation: item.lastKnownLocation || item.location || 'Local Division',
      status: item.status || 'ACTIVE_WARRANT',
      gender,
      age: parseInt(item.age, 10) || 32,
      mugshotUrl: item.mugshotUrl || getMugshotFallback(gender, id),
      baseVectorSimilarity: typeof item.baseVectorSimilarity === 'number' ? item.baseVectorSimilarity : 82.5,
      features: {
        faceShape: item.features?.faceShape || 'Angular Oval',
        jawline: item.features?.jawline || 'Sharp Square',
        eyes: item.features?.eyes || 'Deep-set Almond',
        nose: item.features?.nose || 'Straight Narrow Bridge',
        facialHair: item.features?.facialHair || '3-Day Heavy Stubble',
        marks: item.features?.marks || 'None',
        ageRange: item.features?.ageRange || '28-35'
      }
    };
  });
}
