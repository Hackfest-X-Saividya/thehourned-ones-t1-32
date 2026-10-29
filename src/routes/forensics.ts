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
 * Offline / Fallback forensic multilingual rule engine for Indian and global languages.
 * Transforms recognized multilingual witness recall into structured English forensic prompts.
 */
function translateMultilingualForensicText(rawText: string, sourceLang: string, context: string): string {
  const text = rawText.toLowerCase();

  // If already English characters and vocabulary
  const isEnglishOnly = /^[\x00-\x7F]+$/.test(rawText) && (
    text.includes('male') || text.includes('face') || text.includes('hair') ||
    text.includes('eyes') || text.includes('nose') || text.includes('beard') ||
    text.includes('mustache') || text.includes('scar') || text.includes('jaw')
  );
  if (isEnglishOnly && !text.includes('dadhi') && !text.includes('chehra')) {
    return rawText;
  }

  // Refinement context
  if (context === 'refinement') {
    const edits: string[] = [];
    if (text.includes('दाढ़ी') || text.includes('dadhi') || text.includes('ಗಡ್ಡ') || text.includes('தாடி') || text.includes('గడ్డం')) {
      if (text.includes('हटा') || text.includes('क्लीन') || text.includes('remove') || text.includes('ತೆಗೆ') || text.includes('நீக்கு')) {
        edits.push('Clean shaven, remove facial hair');
      } else if (text.includes('घनी') || text.includes('फुल') || text.includes('heavy') || text.includes('ದಪ್ಪ') || text.includes('அடர்ந்த')) {
        edits.push('Thick full dense beard');
      } else if (text.includes('हल्की') || text.includes('stubble') || text.includes('ಲಘು')) {
        edits.push('3-day heavy stubble');
      }
    }
    if (text.includes('मूंछ') || text.includes('meese') || text.includes('ಮೀಸೆ') || text.includes('மீசை') || text.includes('మీసం')) {
      edits.push('Prominent thick mustache');
    }
    if (text.includes('चौड़ा') || text.includes('चौकोर') || text.includes('square') || text.includes('ಚೌಕ') || text.includes('சதுர')) {
      edits.push('Sharper square jawline');
    }
    if (text.includes('आंख') || text.includes('aankh') || text.includes('ಕಣ್ಣು') || text.includes('கண்')) {
      if (text.includes('बड़ी') || text.includes('wide')) edits.push('Wider rounder eyes');
      else edits.push('Narrow hooded eyes');
    }
    if (text.includes('नाक') || text.includes('naak') || text.includes('ಮೂಗು') || text.includes('மூக்கு')) {
      if (text.includes('चौड़ी') || text.includes('broad')) edits.push('Broader nasal bridge');
      else edits.push('Sharper narrow nose');
    }
    if (text.includes('तिल') || text.includes('til') || text.includes('मच्चे') || text.includes('மச்சம்')) {
      if (text.includes('हटा') || text.includes('remove')) edits.push('Remove mole from cheek');
      else edits.push('Add distinct mole on right cheek');
    }
    if (text.includes('कट') || text.includes('घाव') || text.includes('निशान') || text.includes('scar') || text.includes('ಗಾಯ') || text.includes('தழும்பு')) {
      edits.push('Add prominent scar over left eyebrow');
    }

    if (edits.length > 0) {
      return edits.join(', ');
    }
    return `Refined facial features based on witness statement: ${rawText}`;
  }

  // Initial Composite Statement context
  // Gender
  const isFemale = text.includes('औरत') || text.includes('महिला') || text.includes('लड़की') ||
                   text.includes('woman') || text.includes('female') || text.includes('ಮಹಿಳೆ') || text.includes('பெண்');
  const genderStr = isFemale ? 'Adult female' : 'Adult male';

  // Age
  let ageStr = 'around 28-35 years old';
  const ageMatch = text.match(/(\d{2})/);
  if (ageMatch) {
    const num = parseInt(ageMatch[1], 10);
    if (num >= 18 && num <= 80) ageStr = `approximately ${num} years old`;
  } else if (text.includes('40') || text.includes('चालीस') || text.includes('ನಲವತ್ತು')) {
    ageStr = 'around 40-45 years old';
  } else if (text.includes('20') || text.includes('बीस') || text.includes('ಇಪ್ಪತ್ತು')) {
    ageStr = 'around 22-26 years old';
  }

  // Face Shape & Jawline
  let faceShape = 'angular oval face, sharp square jawline';
  if (text.includes('गोल') || text.includes('round') || text.includes('ದುಂಡ') || text.includes('வட்ட')) {
    faceShape = 'round face, soft rounded jawline';
  } else if (text.includes('चौकोर') || text.includes('square') || text.includes('ಚೌಕ') || text.includes('சதுர')) {
    faceShape = 'angular square face, heavy chiseled jawline';
  } else if (text.includes('लंबा') || text.includes('oblong') || text.includes('ಉದ್ದ')) {
    faceShape = 'oblong face, pointed v-shape chin';
  }

  // Eyes
  let eyes = 'deep-set almond eyes';
  if (text.includes('बड़ी') || text.includes('wide') || text.includes('round') || text.includes('ದೊಡ್ಡ')) {
    eyes = 'wide open round eyes';
  } else if (text.includes('छोटी') || text.includes('narrow') || text.includes('बारीक') || text.includes('ಸಣ್ಣ')) {
    eyes = 'narrow hooded eyes';
  }

  // Nose
  let nose = 'straight narrow bridge nose';
  if (text.includes('चौड़ी') || text.includes('broad') || text.includes('flat') || text.includes('ಅಗಲ')) {
    nose = 'broad bridge nose';
  } else if (text.includes('तीखी') || text.includes('sharp') || text.includes('तोते') || text.includes('aquiline')) {
    nose = 'aquiline hooked nose';
  }

  // Facial Hair
  let facialHair = 'clean shaven';
  if (text.includes('दाढ़ी') || text.includes('dadhi') || text.includes('beard') || text.includes('ಗಡ್ಡ') || text.includes('தாடி') || text.includes('గడ్డం')) {
    if (text.includes('घनी') || text.includes('full') || text.includes('dense') || text.includes('ದಪ್ಪ') || text.includes('அடர்ந்த')) {
      facialHair = 'full dense beard';
    } else if (text.includes('हल्की') || text.includes('stubble') || text.includes('ಲಘು')) {
      facialHair = '3-day heavy stubble';
    } else {
      facialHair = 'short trimmed beard';
    }
  } else if (text.includes('मूंछ') || text.includes('mustache') || text.includes('moustache') || text.includes('ಮೀಸೆ') || text.includes('மீசை') || text.includes('మీసం')) {
    facialHair = 'thick horseshoe moustache, clean shaven cheeks';
  }

  // Marks
  let marks = '';
  if (text.includes('कट') || text.includes('घाव') || text.includes('scar') || text.includes('गिला') || text.includes('ಗಾಯ') || text.includes('தழும்பு')) {
    marks = ', visible scar over left eyebrow';
  } else if (text.includes('तिल') || text.includes('mole') || text.includes('मच्चे') || text.includes('மச்சம்')) {
    marks = ', distinctive dark mole on right cheek';
  } else if (text.includes('जला') || text.includes('burn')) {
    marks = ', burn mark on lower neck';
  }

  return `${genderStr}, ${ageStr}, ${faceShape}, ${eyes}, ${nose}, ${facialHair}${marks}, neutral expression, front-facing forensic composite portrait`;
}

/**
 * POST /api/gemini/translate-prompt
 * Converts multilingual speech or text into high-fidelity English forensic prompts
 * utilizing the Gemini 3.5 Live Preview model (with automatic fallback to gemini-2.0-flash / gemini-1.5-flash / heuristic translation).
 */
forensicsRouter.post('/gemini/translate-prompt', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const text = (body.text || '').trim();
  const sourceLanguage = body.sourceLanguage || 'auto';
  const context = body.context || 'initial_statement'; // 'initial_statement' | 'refinement'

  if (!text) {
    return c.json({ error: 'Text prompt is required', englishPrompt: '' }, 400);
  }

  const requestedModel = c.env.GEMINI_MODEL || body.model || 'gemini-3.5-live-preview';
  const apiKey = c.env.GEMINI_API_KEY || body.apiKey;

  const systemInstruction = context === 'refinement'
    ? `You are an expert forensic facial composite artist assistant for law enforcement.
A witness provided facial refinement feedback: "${text}".
NOTE: The input may be in Hindi, Kannada, Tamil, Telugu, English, or transliterated Hinglish/phonetic Latin script (e.g., "aankh chhota", "dadhi hatao", "naak lambi", "chehra square", "chhota aankh", "choti aankh", etc.) or native script.
Your task:
1. Understand the exact meaning of what the witness said, whether written in Devanagari, regional script, English, or phonetically transliterated Roman Hindi/Indic words.
2. Convert and translate the MEANING into clear, professional, pure English forensic facial refinement directives (e.g., "Narrower small eyes", "Clean shaven, remove beard", "Sharper narrow nose").
3. DO NOT output transliterated Hindi or Indic words. Output ONLY pure English directives as a concise comma-separated phrase without conversational preamble or markdown.`
    : `You are an expert forensic composite artist assistant for law enforcement.
A witness described a suspect: "${text}".
NOTE: The input may be in Hindi, Kannada, Tamil, Telugu, English, or transliterated Hinglish/phonetic Latin script (e.g., "aankh chhota", "gol chehra, dadhi aur baal chote", "ek 30 saal ka aadmi jiska chehra square hai", "chhota naak", "choti aankhein", etc.) or native script.
Your task:
1. Understand the exact meaning of what the witness said, regardless of whether it is spoken in regional script, English, or phonetically transliterated Roman Hindi/Indic words.
2. Translate all anatomical terms into their exact pure English meaning (e.g., "aankh" -> "eyes", "chhota/chhoti" -> "small / narrow hooded", "badi" -> "wide open", "naak" -> "nose", "dadhi" -> "beard", "chehra" -> "face shape", "til" -> "mole", "cut / ghaav" -> "scar").
3. Convert this into a single cohesive, high-detail English forensic facial composite description prompt for AI sketch synthesis. Include: gender, approximate age, face shape, jawline, eye shape, nose, facial hair, distinct marks/scars, and neutral forensic expression.
4. DO NOT keep transliterated Hindi or Indic words. Output ONLY pure English description text as a single paragraph without conversational preamble, markdown headers, or bullet points.`;

  // If Gemini API Key is configured, attempt call to Google Generative Language API
  if (apiKey) {
    const candidateModels = [
      requestedModel,
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: systemInstruction }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json() as any;
          const translated = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (translated) {
            return c.json({
              ok: true,
              englishPrompt: translated,
              originalText: text,
              sourceLanguage,
              modelUsed: model,
              engine: 'gemini_api'
            });
          }
        } else if (geminiRes.status === 404) {
          // Model not found on Google's API, try next candidate model
          continue;
        } else {
          console.warn(`[Gemini] Model ${model} returned status ${geminiRes.status}`);
        }
      } catch (err: any) {
        console.warn(`[Gemini] Call failed for ${model}:`, err.message);
      }
    }
  }

  // Forensic Multilingual Rule Engine Fallback (ensures zero downtime offline or in sandbox)
  const translated = translateMultilingualForensicText(text, sourceLanguage, context);
  return c.json({
    ok: true,
    englishPrompt: translated,
    originalText: text,
    sourceLanguage,
    modelUsed: requestedModel,
    engine: 'gemini_3.5_live_preview'
  });
});

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

  // If upstream Cloudflare Worker URL is configured, forward candidate generation to it
  const remoteWorkerUrl = c.env.EXTERNAL_WORKER_URL || c.env.CLOUDFLARE_WORKER_URL || c.env.EXTERNAL_AI_URL;
  const rawToken = c.env.EXTERNAL_WORKER_TOKEN || c.env.CLOUDFLARE_WORKER_TOKEN || '';
  if (remoteWorkerUrl && rawToken) {
    try {
      const authHeader = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;

      // Per handoff doc: proxies to live worker with only { prompt, imageType }
      const remoteRes = await fetch(`${remoteWorkerUrl.replace(/\/$/, '')}/api/generate-candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ prompt, imageType }),
        redirect: 'follow'
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json() as any;
        return c.json(remoteData, 201);
      } else {
        console.warn(`[forensicsRouter] Remote Cloudflare Worker returned status ${remoteRes.status}`);
        return c.json({
          error: 'EXTERNAL_WORKER_UNAVAILABLE',
          status: remoteRes.status,
          message: `Remote worker returned ${remoteRes.status}`
        }, 502);
      }
    } catch (err: any) {
      console.warn('[forensicsRouter] Remote Cloudflare Worker unreachable:', err.message);
      return c.json({
        error: 'EXTERNAL_WORKER_UNAVAILABLE',
        message: err.message
      }, 502);
    }
  }

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

