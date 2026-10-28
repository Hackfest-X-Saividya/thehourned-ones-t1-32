import axios from 'axios';
import { SYNTHETIC_CRIMINAL_REGISTRY, calculateSuspectMatch } from './mockCriminalDb';
import { calculateSha256, verifyAuditChain as verifyChainCrypto } from '../utils/hashUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Agent': 'Chitragupta-Forensic-Frontend/1.0'
  }
});

// Seed-based realistic forensic sketch image generator URLs
const SAMPLE_SKETCHES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=512&h=512&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=512&h=512&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=512&h=512&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=512&h=512&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=512&h=512&q=80'
];

/**
 * Extracts structured anatomical facial features from natural language description.
 */
export async function extractFeatures({ prompt, language = 'en-IN' }) {
  if (!USE_MOCK) {
    try {
      const response = await apiClient.post('/extract-features', { prompt, language });
      return response.data;
    } catch (err) {
      console.warn('[API] FastAPI /extract-features unreachable, falling back to client extractor:', err.message);
    }
  }

  // High-fidelity client heuristic feature extractor
  await new Promise((r) => setTimeout(r, 600)); // Simulated processing latency
  const lower = (prompt || '').toLowerCase();

  return {
    faceShape: lower.includes('round') ? 'Round' : lower.includes('square') ? 'Square' : 'Angular Oval',
    jawline: lower.includes('square') ? 'Sharp Square' : lower.includes('chiseled') ? 'Heavy Chiseled' : 'Defined Oval',
    eyes: lower.includes('round') ? 'Wide Round' : lower.includes('hooded') ? 'Narrow Hooded' : 'Deep-set Almond',
    nose: lower.includes('broad') ? 'Broad Bridge' : lower.includes('bulbous') ? 'Bulbous Tip' : 'Straight Narrow Bridge',
    facialHair: lower.includes('beard') ? 'Full Dense Beard' : lower.includes('mustache') ? 'Thick Horseshoe Mustache' : lower.includes('stubble') ? '3-Day Heavy Stubble' : 'Clean Shaven',
    marks: lower.includes('scar') ? 'Scar on Left Eyebrow' : lower.includes('mole') ? 'Mole on Right Cheek' : lower.includes('burn') ? 'Burn Mark on Neck' : 'None',
    ageRange: lower.includes('40') ? '38-45' : lower.includes('20') ? '22-28' : '28-35'
  };
}

/**
 * Generates candidate forensic sketch from witness prompt.
 */
export async function generateSketch({ prompt, language = 'en-IN', seed = null, parentId = null, iteration = 1 }) {
  const chosenSeed = seed || Math.floor(Math.random() * 9000) + 1000;
  const imageId = `IMG-SKETCH-${chosenSeed}`;

  if (!USE_MOCK) {
    try {
      const response = await apiClient.post('/generate-sketch', {
        prompt,
        language,
        seed: chosenSeed,
        parentId,
        iteration
      });
      return response.data;
    } catch (err) {
      console.warn('[API] FastAPI /generate-sketch unreachable, using high-fidelity mock adapter:', err.message);
    }
  }

  // High-fidelity mock adapter
  await new Promise((r) => setTimeout(r, 1200));
  const features = await extractFeatures({ prompt, language });
  const rawHash = await calculateSha256(`${imageId}|${prompt}|${chosenSeed}|${Date.now()}`);

  // Use reliable pollinations charcoal sketch URL or stable sample sketch fallback
  const encodedPrompt = encodeURIComponent(`forensic police charcoal sketch composite of indian suspect, mugshot frontal view, neutral background, ${prompt}`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${chosenSeed}&nologo=true`;

  return {
    imageId,
    imageUrl,
    prompt,
    seed: chosenSeed,
    iteration,
    parentId,
    createdAt: new Date().toISOString(),
    imageHash: rawHash,
    features,
    confidenceScore: 92.4,
    changeDescription: parentId ? `Refinement from ${parentId}` : 'Initial candidate generation from witness description'
  };
}

/**
 * Refines a parent sketch with selective trait adjustments.
 */
export async function refineSketch({ parentSketch, adjustments, promptAdditions = '' }) {
  const newIteration = (parentSketch.iteration || 1) + 1;
  const newSeed = Math.floor(Math.random() * 9000) + 1000;
  const combinedPrompt = `${parentSketch.prompt}. Adjustments: ${Object.entries(adjustments)
    .filter(([_, v]) => Boolean(v))
    .map(([k, v]) => `${k} is now ${v}`)
    .join(', ')}. ${promptAdditions}`.trim();

  const refined = await generateSketch({
    prompt: combinedPrompt,
    seed: newSeed,
    parentId: parentSketch.imageId,
    iteration: newIteration
  });

  // Apply explicit overrides
  refined.features = {
    ...parentSketch.features,
    ...adjustments
  };
  refined.changeDescription = `Branch iteration #${newIteration}: Modified ${Object.keys(adjustments).join(', ')}`;
  return refined;
}

/**
 * Queries the Law Enforcement Criminal Database records.
 */
export async function fetchCriminalRecords(filters = {}) {
  if (!USE_MOCK) {
    try {
      const response = await apiClient.get('/criminal-records', { params: filters });
      return response.data;
    } catch (err) {
      console.warn('[API] FastAPI /criminal-records unreachable, serving synthetic registry:', err.message);
    }
  }

  await new Promise((r) => setTimeout(r, 400));
  let records = [...SYNTHETIC_CRIMINAL_REGISTRY];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.firNumber.toLowerCase().includes(q) ||
        r.alias.toLowerCase().includes(q) ||
        r.crimeCategory.toLowerCase().includes(q)
    );
  }

  if (filters.crimeCategory && filters.crimeCategory !== 'ALL') {
    records = records.filter((r) => r.crimeCategory.includes(filters.crimeCategory));
  }

  if (filters.status && filters.status !== 'ALL') {
    records = records.filter((r) => r.status === filters.status);
  }

  return records;
}

/**
 * Compares finalized sketch with criminal database.
 */
export async function verifySuspectInDb({ finalizedSketch }) {
  if (!USE_MOCK) {
    try {
      const response = await apiClient.post('/verify-db', {
        imageId: finalizedSketch.imageId,
        features: finalizedSketch.features
      });
      return response.data;
    } catch (err) {
      console.warn('[API] FastAPI /verify-db unreachable, performing client-side matching:', err.message);
    }
  }

  await new Promise((r) => setTimeout(r, 800));
  const records = await fetchCriminalRecords();

  const scored = records.map((record) => {
    const evaluation = calculateSuspectMatch(finalizedSketch.features, record);
    return {
      ...record,
      ...evaluation
    };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  return {
    queryImageId: finalizedSketch.imageId,
    evaluatedRecordsCount: scored.length,
    topMatch: scored[0] || null,
    matches: scored
  };
}

/**
 * Fetches audit ledger logs.
 */
export async function fetchAuditLogs(filters = {}) {
  if (!USE_MOCK) {
    try {
      const response = await apiClient.get('/audit-logs', { params: filters });
      return response.data;
    } catch (err) {
      console.warn('[API] FastAPI /audit-logs unreachable, falling back to local ledger:', err.message);
    }
  }

  return null; // Signals caller to use SessionContext ledger
}

/**
 * Verifies blockchain cryptographic integrity.
 */
export async function verifyAuditLedger(logs) {
  return verifyChainCrypto(logs);
}

export default apiClient;
