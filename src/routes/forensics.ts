import { Hono } from 'hono';
import { Env, HonoVariables } from '../types';
import { ImageService } from '../services/image.service';

export const forensicsRouter = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Synthetic criminal database records for law enforcement verification
const CRIMINAL_REGISTRY = [
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
      faceShape: 'Angular Oval',
      jawline: 'Sharp Square',
      eyes: 'Deep-set Almond',
      nose: 'Straight Narrow Bridge',
      facialHair: 'Full Dense Beard',
      marks: 'Laceration near Lip',
      ageRange: '30-36'
    },
    biometricAudit: {
      registeredDate: '2025-06-11T11:20:00Z',
      fingerprintCode: 'AFIS-KA-77821',
      custodyStatus: 'Inter-State Fugitive'
    }
  }
];

/**
 * POST /api/extract-features
 * Extracts structured anatomical facial features from natural language description
 */
forensicsRouter.post('/extract-features', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = (body.prompt || '').toLowerCase();

  const extracted = {
    faceShape: prompt.includes('round') ? 'Round' : prompt.includes('square') ? 'Square' : 'Angular Oval',
    jawline: prompt.includes('square') ? 'Sharp Square' : prompt.includes('chiseled') ? 'Heavy Chiseled' : prompt.includes('soft') ? 'Soft Rounded' : 'Sharp Square',
    eyes: prompt.includes('round') ? 'Wide Round' : prompt.includes('hooded') ? 'Narrow Hooded' : 'Deep-set Almond',
    nose: prompt.includes('broad') ? 'Broad Bridge' : prompt.includes('bulbous') ? 'Bulbous Tip' : 'Straight Narrow Bridge',
    facialHair: prompt.includes('beard') ? 'Full Dense Beard' : prompt.includes('mustache') ? 'Thick Horseshoe Mustache' : prompt.includes('stubble') ? '3-Day Heavy Stubble' : 'Clean Shaven',
    marks: prompt.includes('scar') ? 'Scar on Left Eyebrow' : prompt.includes('mole') ? 'Mole on Right Cheek' : prompt.includes('burn') ? 'Burn Mark on Neck' : 'None',
    ageRange: prompt.includes('40') ? '38-45' : prompt.includes('20') ? '22-28' : '28-35'
  };

  return c.json(extracted);
});

/**
 * GET /api/criminal-records
 * Lists criminal database records with search, crimeCategory, and status filters
 */
forensicsRouter.get('/criminal-records', async (c) => {
  const query = c.req.query();
  let records = [...CRIMINAL_REGISTRY];

  if (query.search) {
    const q = query.search.toLowerCase();
    records = records.filter(
      r =>
        r.fullName.toLowerCase().includes(q) ||
        r.firNumber.toLowerCase().includes(q) ||
        r.alias.toLowerCase().includes(q) ||
        r.crimeCategory.toLowerCase().includes(q)
    );
  }

  if (query.crimeCategory && query.crimeCategory !== 'ALL') {
    records = records.filter(r => r.crimeCategory.includes(query.crimeCategory));
  }

  if (query.status && query.status !== 'ALL') {
    records = records.filter(r => r.status === query.status);
  }

  return c.json(records);
});

/**
 * POST /api/verify-db
 * Compares suspect features against criminal registry
 */
forensicsRouter.post('/verify-db', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const suspectFeatures = body.features || {};

  const scored = CRIMINAL_REGISTRY.map(record => {
    let matchedTraits: string[] = [];
    const keys = Object.keys(record.features);

    keys.forEach(k => {
      const sVal = (suspectFeatures[k] || '').toLowerCase();
      const cVal = ((record.features as any)[k] || '').toLowerCase();
      if (sVal && cVal) {
        if (sVal === cVal || sVal.includes(cVal) || cVal.includes(sVal)) {
          matchedTraits.push(k);
        }
      }
    });

    const featureScore = (matchedTraits.length / Math.max(1, keys.length)) * 100;
    const vectorScore = record.baseVectorSimilarity || 50.0;
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
      ...record,
      combinedScore,
      vectorSimilarity: vectorScore,
      featureScore: parseFloat(featureScore.toFixed(1)),
      matchedTraits,
      totalTraitsCount: keys.length,
      verdict,
      verdictLabel,
      verdictColor
    };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  return c.json({
    queryImageId: body.imageId || 'IMG-QUERY',
    evaluatedRecordsCount: scored.length,
    topMatch: scored[0] || null,
    matches: scored
  });
});

/**
 * POST /api/generate-candidates
 * Compatibility endpoint matching deployed Cloudflare Worker API contract
 */
forensicsRouter.post('/generate-candidates', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt || 'Adult male suspect with defined features';
  const imageType = body.imageType || 'sketch';
  const numCandidates = Math.min(Math.max(Number(body.numCandidates) || 4, 1), 4);
  const caseId = body.caseId || 'case_sample_001';

  const user = c.get('user') || {
    id: 'usr_investigator_1',
    name: 'Detective Sarah Connor',
    email: 'sconnor@forensics.pd.gov',
    role: 'investigator' as const
  };
  const requestId = c.get('requestId') || 'req_cand_gen';

  const imageService = new ImageService(c.env);
  const modelName = imageType === 'sketch'
    ? '@cf/stabilityai/stable-diffusion-xl-base-1.0'
    : '@cf/bytedance/stable-diffusion-xl-lightning';

  const result = await imageService.generateCandidates(
    {
      caseId,
      prompt,
      modelName,
      numCandidates,
      parameters: { imageType }
    },
    user,
    requestId
  );

  return c.json({
    status: 'success',
    caseId,
    totalCandidates: result.candidates.length,
    candidates: result.candidates.map((cand, idx) => ({
      id: cand.id,
      label: `Candidate ${String.fromCharCode(65 + idx)}`,
      imageType,
      model: cand.modelName,
      imageUrl: cand.imageUrl,
      previewDataUri: cand.previewDataUri
    }))
  }, 201);
});

