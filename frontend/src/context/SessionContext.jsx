import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateBlockHash, calculateSha256 } from '../utils/hashUtils';
import { selectCandidateImage, fetchSavedCandidateSelection } from '../services/api';

const SessionContext = createContext();

const INITIAL_SKETCH = {
  imageId: 'IMG-SKETCH-1042',
  imageUrl: '/api/images/IMG-SKETCH-1042/file',
  prompt: 'Male, early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow',
  seed: 1042,
  iteration: 1,
  parentId: null,
  createdAt: '2026-10-28T09:30:00.000Z',
  imageHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  confidenceScore: 94.2,
  changeDescription: 'Initial witness testimony composite generated via forensic multimodal pipeline',
  features: {
    faceShape: 'Angular Oval',
    jawline: 'Sharp Square',
    eyes: 'Deep-set Almond',
    nose: 'Straight Narrow Bridge',
    facialHair: '3-Day Heavy Stubble',
    marks: 'Scar on Left Eyebrow',
    ageRange: '28-35'
  }
};

export function SessionProvider({ children }) {
  // Active Officer & Jurisdiction Identity
  const [officer] = useState({
    id: 'OFF-KA-402',
    name: 'Insp. Vikram Rao',
    unit: 'Cyber & Forensic Crime Cell',
    badge: 'KSP-CID-772',
    rank: 'Senior Forensic Investigator'
  });

  const [sessionId] = useState('SES-2026-8841');
  const [caseNumber] = useState('FIR-BLR-2026-0194');
  const [caseInfo] = useState({
    incidentType: 'Armed Commercial Robbery',
    policeStation: 'Hebbal Police Station, Bengaluru',
    witnessCode: 'WIT-BLR-099',
    interviewDate: '28 Oct 2026'
  });

  // Stored Session-wise image iterations with localStorage persistence across refreshes
  const [sessionImages, setSessionImages] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_session_images');
      return saved ? JSON.parse(saved) : [INITIAL_SKETCH];
    } catch {
      return [INITIAL_SKETCH];
    }
  });

  // Selected Finalized Composite for DB verification and high-res export
  const [finalizedSketch, setFinalizedSketch] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_finalized_sketch');
      return saved ? JSON.parse(saved) : INITIAL_SKETCH;
    } catch {
      return INITIAL_SKETCH;
    }
  });

  // Persisted Graph Canvas Nodes & Edges across page navigations & refreshes
  const [canvasNodes, setCanvasNodes] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_canvas_nodes');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [canvasEdges, setCanvasEdges] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_canvas_edges');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Criminal Database Integrator State: 'SYNTHETIC_DEMO' | 'CUSTOM_IMPORTED'
  const [registryMode, setRegistryMode] = useState(() => {
    try {
      return localStorage.getItem('forensic_registry_mode') || 'SYNTHETIC_DEMO';
    } catch {
      return 'SYNTHETIC_DEMO';
    }
  });

  const [customDbRecords, setCustomDbRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_custom_db');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const updateCustomDatabase = useCallback((records, mode = 'CUSTOM_IMPORTED') => {
    setCustomDbRecords(records);
    setRegistryMode(mode);
    try {
      localStorage.setItem('forensic_custom_db', JSON.stringify(records));
      localStorage.setItem('forensic_registry_mode', mode);
    } catch {
      // Ignore
    }
  }, []);

  const resetToDefaultRegistry = useCallback(() => {
    setRegistryMode('SYNTHETIC_DEMO');
    try {
      localStorage.setItem('forensic_registry_mode', 'SYNTHETIC_DEMO');
    } catch {
      // Ignore
    }
  }, []);

  // Reusable Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Tamper-Proof Cryptographic Blockchain Audit Ledger
  const [auditLogs, setAuditLogs] = useState([
    {
      blockIndex: 1,
      sessionId: 'SES-2026-8841',
      caseNumber: 'FIR-BLR-2026-0194',
      imageId: 'GENESIS',
      memberId: 'OFF-KA-402',
      memberName: 'Insp. Vikram Rao',
      action: 'SESSION_INITIALIZED',
      metadata: 'Forensic session initiated; witness cognitive interview commenced',
      timestamp: '2026-10-28T09:00:00.000Z',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      currHash: '4a9e8b2c1d3f5a7e9b0c2d4f6a8e1b3c5d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b'
    },
    {
      blockIndex: 2,
      sessionId: 'SES-2026-8841',
      caseNumber: 'FIR-BLR-2026-0194',
      imageId: 'IMG-SKETCH-1042',
      memberId: 'OFF-KA-402',
      memberName: 'Insp. Vikram Rao',
      action: 'SKETCH_NODE_GENERATED',
      metadata: 'Initial composite sketch generated with seed 1042',
      timestamp: '2026-10-28T09:30:00.000Z',
      prevHash: '4a9e8b2c1d3f5a7e9b0c2d4f6a8e1b3c5d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b',
      currHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
    }
  ]);

  // Synchronously compute Genesis and initial block hashes to ensure genuine cryptographic links
  useEffect(() => {
    async function initAuditHashes() {
      const b1 = auditLogs[0];
      const h1 = await generateBlockHash(b1);
      const b2 = { ...auditLogs[1], prevHash: h1 };
      const h2 = await generateBlockHash(b2);

      setAuditLogs([
        { ...b1, currHash: h1 },
        { ...b2, currHash: h2 }
      ]);
    }
    initAuditHashes();
  }, []);

  // Records a new audit action chained to the previous block's hash
  const recordAuditAction = useCallback(async (action, imageId = 'N/A', metadata = '') => {
    setAuditLogs((prevLogs) => {
      const lastBlock = prevLogs[prevLogs.length - 1];
      const nextIndex = lastBlock.blockIndex + 1;
      const timestamp = new Date().toISOString();

      const blockDraft = {
        blockIndex: nextIndex,
        sessionId,
        caseNumber,
        imageId,
        memberId: officer.id,
        memberName: officer.name,
        action,
        metadata: metadata || `Action executed by ${officer.name} on image ${imageId}`,
        timestamp,
        prevHash: lastBlock.currHash,
        currHash: '' // Will be updated
      };

      // Calculate hash asynchronously and update state
      generateBlockHash(blockDraft).then((calculatedHash) => {
        setAuditLogs((current) =>
          current.map((blk) => (blk.blockIndex === nextIndex ? { ...blk, currHash: calculatedHash } : blk))
        );
      });

      return [...prevLogs, blockDraft];
    });
  }, [sessionId, caseNumber, officer.id, officer.name]);

  // Allows toggling mock tampering for demonstration of cryptographic detection
  const simulateTamper = useCallback((targetBlockIndex) => {
    setAuditLogs((prev) =>
      prev.map((blk) => {
        if (blk.blockIndex === targetBlockIndex) {
          return {
            ...blk,
            action: `${blk.action}_TAMPERED`,
            metadata: 'UNAUTHORIZED_DATA_MODIFICATION_DETECTED'
          };
        }
        return blk;
      })
    );
    addToast(`Tamper simulated on Block #${targetBlockIndex}! Run integrity check to detect.`, 'warning');
  }, [addToast]);

  // Re-hash chain to restore integrity
  const restoreChainIntegrity = useCallback(async () => {
    const restored = [];
    for (let i = 0; i < auditLogs.length; i++) {
      const blk = { ...auditLogs[i] };
      if (i === 0) {
        blk.prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      } else {
        blk.prevHash = restored[i - 1].currHash;
      }
      // Strip any tamper markers
      blk.action = blk.action.replace('_TAMPERED', '');
      blk.currHash = await generateBlockHash(blk);
      restored.push(blk);
    }
    setAuditLogs(restored);
    addToast('Cryptographic audit chain restored and re-hashed.', 'success');
  }, [auditLogs, addToast]);

  // Persist session images & finalized sketch to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('forensic_session_images', JSON.stringify(sessionImages));
    } catch {
      // Ignore quota
    }
  }, [sessionImages]);

  useEffect(() => {
    if (finalizedSketch) {
      try {
        localStorage.setItem('forensic_finalized_sketch', JSON.stringify(finalizedSketch));
      } catch {
        // Ignore quota
      }
    }
  }, [finalizedSketch]);

  // Sync canvas nodes & edges to localStorage
  const updateCanvasNodes = useCallback((nodes) => {
    setCanvasNodes(nodes);
    try {
      localStorage.setItem('forensic_canvas_nodes', JSON.stringify(nodes));
    } catch {}
  }, []);

  const updateCanvasEdges = useCallback((edges) => {
    setCanvasEdges(edges);
    try {
      localStorage.setItem('forensic_canvas_edges', JSON.stringify(edges));
    } catch {}
  }, []);

  // Sync saved candidate selection from backend on mount
  useEffect(() => {
    let isSubscribed = true;
    async function syncBackendSelection() {
      try {
        const savedId = await fetchSavedCandidateSelection({ caseId: caseNumber });
        if (savedId && isSubscribed) {
          const match = sessionImages.find((img) => img.imageId === savedId);
          if (match && match.imageId !== finalizedSketch?.imageId) {
            setFinalizedSketch(match);
          }
        }
      } catch (err) {
        // Silent fallback
      }
    }
    syncBackendSelection();
    return () => {
      isSubscribed = false;
    };
  }, [caseNumber]);

  // Adds a newly generated or refined sketch to the session
  const addSessionSketch = useCallback((newSketch) => {
    setSessionImages((prev) => [newSketch, ...prev]);
    setFinalizedSketch(newSketch);
  }, []);

  // Adds multiple candidate sketches generated in stage 1
  const addSessionSketches = useCallback((newSketches, activeCandidateIndex = 0) => {
    if (!newSketches || newSketches.length === 0) return;
    setSessionImages((prev) => [...newSketches, ...prev]);
    if (newSketches[activeCandidateIndex]) {
      setFinalizedSketch(newSketches[activeCandidateIndex]);
    }
  }, []);

  // Finalizes the sketch as active base image, persists to backend and logs audit event
  const finalizeSketch = useCallback((sketch) => {
    setFinalizedSketch(sketch);
    recordAuditAction('SELECTED_AS_BASE_IMAGE', sketch.imageId, `Selected iteration #${sketch.iteration} as active base composite for refinement`);
    addToast(`Sketch ${sketch.imageId} selected as Base Image for refinement.`, 'success');

    // Persist selected candidate image through the backend service
    selectCandidateImage({ caseId: caseNumber, imageId: sketch.imageId }).catch((err) => {
      console.warn('[SessionContext] Async candidate selection sync notice:', err.message);
    });
  }, [recordAuditAction, addToast, caseNumber]);

  return (
    <SessionContext.Provider
      value={{
        officer,
        sessionId,
        caseNumber,
        caseInfo,
        sessionImages,
        addSessionSketch,
        addSessionSketches,
        finalizedSketch,
        finalizeSketch,
        auditLogs,
        recordAuditAction,
        simulateTamper,
        restoreChainIntegrity,
        toasts,
        addToast,
        removeToast,
        canvasNodes,
        setCanvasNodes: updateCanvasNodes,
        canvasEdges,
        setCanvasEdges: updateCanvasEdges,
        registryMode,
        setRegistryMode,
        customDbRecords,
        updateCustomDatabase,
        resetToDefaultRegistry
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
